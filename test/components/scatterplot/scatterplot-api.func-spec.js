import { Line } from '../../../src/components/line/line';

const chartHTML = require('../../../app/views/components/scatterplot/example-index.html');
const svg = require('../../../src/components/icons/svg.html');

let svgEl;
let chartAPI;
const scatterData = [{
  data: [{
    name: 'January',
    value: {
      x: 5,
      y: 3
    }
  }, {
    name: 'February',
    value: {
      x: 37,
      y: 5
    }
  }, {
    name: 'March',
    value: {
      x: 10,
      y: 5.3
    }
  }, {
    name: 'April',
    value: {
      x: 80,
      y: 6
    }
  }, {
    name: 'May',
    value: {
      x: 21,
      y: 4.8
    }
  }, {
    name: 'June',
    value: {
      x: 72,
      y: 5.2
    }
  }, {
    name: 'July',
    value: {
      x: 26,
      y: 8
    }
  }, {
    name: 'August',
    value: {
      x: 71,
      y: 3.9
    }
  }, {
    name: 'September',
    value: {
      x: 85,
      y: 8
    }
  }, {
    name: 'October',
    value: {
      x: 52,
      y: 3
    }
  }, {
    name: 'November',
    value: {
      x: 44,
      y: 5.9
    }
  }, {
    name: 'December',
    value: {
      x: 110,
      y: 7
    }
  }],
  name: 'Series 01',
  labels: {
    name: 'Series',
    value: {
      x: 'Revenue',
      y: 'Sold'
    }
  },
  // Use d3 Format - only value will be formated
  valueFormatterString: {
    z: '0.0%'
  }
},
{
  data: [{
    name: 'January',
    value: {
      x: 9,
      y: 3.2
    }
  }, {
    name: 'February',
    value: {
      x: 12,
      y: 6.3
    }
  }, {
    name: 'March',
    value: {
      x: 65,
      y: 4
    }
  }, {
    name: 'April',
    value: {
      x: 27,
      y: 7
    }
  }, {
    name: 'May',
    value: {
      x: 29,
      y: 8.5
    }
  }, {
    name: 'June',
    value: {
      x: 81,
      y: 3.9
    }
  }, {
    name: 'July',
    value: {
      x: 33,
      y: 4.1
    }
  }, {
    name: 'August',
    value: {
      x: 75,
      y: 4
    }
  }, {
    name: 'September',
    value: {
      x: 39,
      y: 7
    }
  }, {
    name: 'October',
    value: {
      x: 80,
      y: 2
    }
  }, {
    name: 'November',
    value: {
      x: 48,
      y: 6.2
    }
  }, {
    name: 'December',
    value: {
      x: 99,
      y: 4
    }
  }],
  name: 'Series 02'
}];

describe('Scatter Plot API', () => {
  beforeEach(() => {
    svgEl = null;
    chartAPI = null;
    document.body.insertAdjacentHTML('afterbegin', svg);
    document.body.insertAdjacentHTML('afterbegin', chartHTML);
    const chartId = document.getElementById('scatterplot-example');
    svgEl = document.body.querySelector('.svg-icons');

    chartAPI = new Line(chartId, { dataset: scatterData, isScatterPlot: true });
  });

  afterEach(() => {
    chartAPI.destroy();
    svgEl.parentNode.removeChild(svgEl);

    const rowEl = document.body.querySelector('.row');
    rowEl.parentNode.removeChild(rowEl);
  });

  it('Should be defined on jQuery object', () => {
    expect(chartAPI).toEqual(jasmine.any(Object));
  });

  it('Should render plots', () => {
    expect($('.symbol').length).toEqual(26);
  });

  it('Should destroy chart', () => {
    chartAPI.destroy();

    const chartSymbols = document.body.querySelector('.symbol');

    expect(chartSymbols).toBeFalsy();
    expect($('.symbol').length).toEqual(0);
  });
});