import Permutive from './src/js/permutive';

const constructAll = function () {
	Permutive.init('.o-permutive');
	document.removeEventListener('o.DOMContentLoaded', constructAll);
};

document.addEventListener('o.DOMContentLoaded', constructAll);

export default Permutive;
