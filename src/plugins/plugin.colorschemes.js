'use strict';

import { Chart } from 'chart.js';
import { color as Color } from 'chart.js/helpers';

var EXPANDO_KEY = '$colorschemes';

const pluginBase = Chart.defaults;
pluginBase.plugins.colorschemes = {
	scheme: 'brewer.Paired12',
	fillAlpha: 0.5,
	reverse: false,
	override: false
};

function getScheme(scheme) {
	var colorschemes, matches, arr, category;

	if (Array.isArray(scheme)) {
		return scheme;
	} else if (typeof scheme === 'string') {
		colorschemes = Chart.colorschemes || {};

		// For backward compatibility
		matches = scheme.match(/^(brewer\.\w+)([1-3])-(\d+)$/);
		if (matches) {
			scheme = matches[1] + ['One', 'Two', 'Three'][matches[2] - 1] + matches[3];
		} else if (scheme === 'office.Office2007-2010-6') {
			scheme = 'office.OfficeClassic6';
		}

		arr = scheme.split('.');
		category = colorschemes[arr[0]];
		if (category) {
			return category[arr[1]];
		}
	}
}

var ColorSchemesPlugin = {
	id: 'colorschemes',

	beforeUpdate: function(chart, args, options) {
		// Please note that in v3, the args argument was added. It was not used before it was added,
		// so we just check if it is not actually our options object
		if (options === undefined) {
			options = args;
		}

		var scheme = getScheme(options.scheme);
		var fillAlpha = options.fillAlpha;
		var reverse = options.reverse;
		var override = options.override;
		var custom = options.custom;
		var schemeClone, customResult, length, colorIndex, color;

		if (scheme) {
			if (typeof custom === 'function') {
				// clone the original scheme
				schemeClone = scheme.slice();

				// Execute own custom color function
				customResult = custom(schemeClone);

				// check if we really received a filled array; otherwise we keep and use the original scheme
				if (Array.isArray(customResult) && customResult.length) {
					scheme = customResult;
				} else if (Array.isArray(schemeClone) && schemeClone.length) {
					scheme = schemeClone;
				}
			}

			length = scheme.length;

			// Set scheme colors
			chart.config.data.datasets.forEach(function(dataset, datasetIndex) {
				colorIndex = datasetIndex % length;
				color = scheme[reverse ? length - colorIndex - 1 : colorIndex];

				// Object to store which color option is set
				dataset[EXPANDO_KEY] = {};

				switch (dataset.type || chart.config.type) {
				// For line, radar and scatter chart, borderColor and backgroundColor (50% transparent) are set
				case 'line':
				case 'radar':
				case 'scatter':
					if (typeof dataset.backgroundColor === 'undefined' || override) {
						dataset[EXPANDO_KEY].backgroundColor = dataset.backgroundColor;
						dataset.backgroundColor = Color(color).alpha(fillAlpha).rgbString();
					}
					if (typeof dataset.borderColor === 'undefined' || override) {
						dataset[EXPANDO_KEY].borderColor = dataset.borderColor;
						dataset.borderColor = color;
					}
					if (typeof dataset.pointBackgroundColor === 'undefined' || override) {
						dataset[EXPANDO_KEY].pointBackgroundColor = dataset.pointBackgroundColor;
						dataset.pointBackgroundColor = Color(color).alpha(fillAlpha).rgbString();
					}
					if (typeof dataset.pointBorderColor === 'undefined' || override) {
						dataset[EXPANDO_KEY].pointBorderColor = dataset.pointBorderColor;
						dataset.pointBorderColor = color;
					}
					break;
				// For doughnut and pie chart, backgroundColor is set to an array of colors
				case 'doughnut':
				case 'pie':
				case 'polarArea':
					if (typeof dataset.backgroundColor === 'undefined' || override) {
						dataset[EXPANDO_KEY].backgroundColor = dataset.backgroundColor;
						dataset.backgroundColor = dataset.data.map(function(data, dataIndex) {
							colorIndex = dataIndex % length;
							return scheme[reverse ? length - colorIndex - 1 : colorIndex];
						});
					}
					break;
				// For the other chart, only backgroundColor is set
				default:
					if (typeof dataset.backgroundColor === 'undefined' || override) {
						dataset[EXPANDO_KEY].backgroundColor = dataset.backgroundColor;
						dataset.backgroundColor = color;
					}
					break;
				}
			});
		}
	},

	afterUpdate: function(chart) {
		// Unset colors
		chart.config.data.datasets.forEach(function(dataset) {
            if (dataset[EXPANDO_KEY]) {
                if (Object.prototype.hasOwnProperty.call(dataset[EXPANDO_KEY], "backgroundColor")) {
                    dataset.backgroundColor = dataset[EXPANDO_KEY].backgroundColor;
                }
                if (Object.prototype.hasOwnProperty.call(dataset[EXPANDO_KEY], "borderColor")) {
                    dataset.borderColor = dataset[EXPANDO_KEY].borderColor;
                }
                if (Object.prototype.hasOwnProperty.call(dataset[EXPANDO_KEY], "pointBackgroundColor")) {
                    dataset.pointBackgroundColor = dataset[EXPANDO_KEY].pointBackgroundColor;
                }
                if (Object.prototype.hasOwnProperty.call(dataset[EXPANDO_KEY], "pointBorderColor")) {
                    dataset.pointBorderColor = dataset[EXPANDO_KEY].pointBorderColor;
                }
                delete dataset[EXPANDO_KEY];
            }
		});
	},

	beforeEvent: function() {

	},

	afterEvent: function() {

	}
};

const registerPlugin = Chart.register || Chart.plugins.register;
registerPlugin(ColorSchemesPlugin);

export default ColorSchemesPlugin;
