import bootstrap from './bootstrap';
import api from './api';
import pAddon from './pAddon';
import identifyUser from './identifyUser';

class Permutive {
	/**
	 * Class constructor.
	 * @param {HTMLElement} [oPermutiveEl] - The component element in the DOM
	 * @param {Object} [opts={}] - An options object for configuring the component
	 */
	constructor (oPermutiveEl, opts) {
		this.oPermutiveEl = oPermutiveEl;
		this.options = Object.assign({}, {
//TODO move these to the DOM element
			// "id" : "e1c3fd73-dd41-4abd-b80b-4278d52bf7aa",
			// "key"	:	"b2b3b748-e1f6-4bd5-b2f2-26debc8075a3",
			// "useApi" : true
		}, opts || Permutive.getDataAttributes(oPermutiveEl));

console.log(this.options);
//TODO Consents can be derived outside of the package and passed in as config.
		function getConsents() {
			// derive consent options from ft consent cookie
			const re = /FTConsent=([^;]+)/;
			const match = document.cookie.match(re);
			if (!match) {
				// cookie stasis or no consent cookie found
				return {
					behavioral : false
				};
			}
			const consentCookie = decodeURIComponent(match[1]);
			return {
				behavioral: consentCookie.indexOf('behaviouraladsOnsite:on') !== -1
			};
		}

		//By default Permutive assumes consent has been given - we should not run any permutive code when we dont have user consent for behavioural profiling.
		if (!getConsents().behavioral) {return false;}

		// Run the Permutive bootstrap code
		bootstrap(this.options.oPermutiveId, this.options.oPermutiveKey);

		//Attach Permutive scripts
		const HEAD = document.head || document.getElementsByTagName('head')[0];
		var s = document.createElement("script");
		s.async;
		s.type = "text/javascript";
		s.src = "https://cdn.permutive.com/" + this.options.oPermutiveId + "-web.js";
		HEAD.appendChild(s);

// possibly meta-data can be passed from a shared state (or o-ads)
// or possibly pass meta-data as config and / or api-endpoints

		if (this.options.oPermutiveApiendpointUser){
			api(this.options.oPermutiveApiendpointUser, this.options.oPermutiveApiendpointContent).then(
				function(res){
					if (res[0] && res[0].guid) {
						identifyUser(res[0]);
					}
					pAddon(res[1], res[2]);
				}
			);
		}
	}

	/**
	 * Get the data attributes from the PermutiveElement. If the component is being set up
	 * declaratively, this method is used to extract the data attributes from the DOM.
	 * @param {HTMLElement} oPermutiveEl - The component element in the DOM
	 * @returns {Object} - Data attributes as an object
	 */
	static getDataAttributes (oPermutiveEl) {
		if (!(oPermutiveEl instanceof HTMLElement)) {
			return {};
		}
		return Object.keys(oPermutiveEl.dataset).reduce((options, key) => {

			// Ignore data-o-component
			if (key === 'oComponent') {
				return options;
			}

			// Build a concise key and get the option value
			const shortKey = key.replace(/^oPermutive(w)(w+)$/, (m, m1, m2) => m1.toLowerCase() + m2);
			const value = oPermutiveEl.dataset[key];

			// Try parsing the value as JSON, otherwise just set it as a string
			try {
				options[shortKey] = JSON.parse(value.replace(/'/g, '"'));
			} catch (error) {
				options[shortKey] = value;
			}

			return options;
		}, {});
	}

	/**
	 * Initialise the component.
	 * @param {(HTMLElement|String)} rootElement - The root element to intialise the component in, or a CSS selector for the root element
	 * @param {Object} [opts={}] - An options object for configuring the component
	 * @returns {(Permutive|Array<Permutive>)} - Permutive instance(s)
	 */
	static init (rootEl, opts) {
		if (!rootEl) {
			rootEl = document.body;
		}
		if (!(rootEl instanceof HTMLElement)) {
			rootEl = document.querySelector(rootEl);
		}
		if (rootEl instanceof HTMLElement && rootEl.matches('[data-o-component=o-permutive]')) {
			return new Permutive(rootEl, opts);
		}
		return Array.from(rootEl.querySelectorAll('[data-o-component="o-permutive"]'), rootEl => new Permutive(rootEl, opts));
	}
}

export default Permutive;