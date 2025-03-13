import * as echarts from '../../ec-canvas/echarts';

let chart = null;

function initChart(canvas, width, height, dpr) {
  chart = echarts.init(canvas, null, {
    width: width,
    height: height,
    devicePixelRatio: dpr
  });
  canvas.setChart(chart);

  const app = getApp();
  const yearlyData = app.globalData.resultData.yearlyData;
  
  // 准备数据
  const years = yearlyData.map(item => `第${item.year}年`);
  const annualSalary = yearlyData.map(item => (item.annual / 10000).toFixed(1));
  
  const option = {
    backgroundColor: '#ffffff',
    color: ['#4a90e2'],
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        const dataIndex = params[0].dataIndex;
        const yearData = yearlyData[dataIndex];
        return `${years[dataIndex]}<br/>
                 <span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:#4a90e2;"></span>年收入: ${(yearData.annual / 10000).toFixed(1)}万元<br/>
                 <span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:#4a90e2;"></span>月收入: ${(yearData.monthly / 1000).toFixed(1)}千元`;
      },
      backgroundColor: 'rgba(255,255,255,0.9)',
      borderColor: '#e8e8e8',
      borderWidth: 1,
      textStyle: {
        color: '#666'
      },
      extraCssText: 'box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '13%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: years,
      axisLine: {
        lineStyle: {
          color: '#e8e8e8'
        }
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: '#666'
      }
    },
    yAxis: {
      type: 'value',
      name: '年收入(万元)',
      nameTextStyle: {
        color: '#666'
      },
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        formatter: '{value}',
        color: '#666'
      },
      splitLine: {
        lineStyle: {
          color: '#f0f0f0'
        }
      }
    },
    series: [{
      name: '年收入',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      itemStyle: {
        color: '#4a90e2',
        borderColor: '#fff',
        borderWidth: 2
      },
      lineStyle: {
        width: 4,
        shadowColor: 'rgba(74, 144, 226, 0.3)',
        shadowBlur: 10
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [{
            offset: 0,
            color: 'rgba(74, 144, 226, 0.3)'
          }, {
            offset: 1,
            color: 'rgba(74, 144, 226, 0.05)'
          }]
        }
      },
      data: annualSalary,
      markPoint: {
        symbol: 'pin',
        symbolSize: 40,
        itemStyle: {
          color: '#4a90e2'
        },
        data: [
          { type: 'max', name: '最高值' }
        ]
      }
    }]
  };

  chart.setOption(option);
  return chart;
}

Page({
  data: {
    ec: {
      onInit: initChart
    },
    inputData: {},
    resultData: {},
    mode: 'normal' // 默认为标准模式
  },

  onLoad: function() {
    const app = getApp();
    this.setData({
      inputData: app.globalData.inputData,
      resultData: app.globalData.resultData
    });
  },

  switchMode: function(e) {
    const mode = e.currentTarget.dataset.mode;
    this.setData({ mode: mode });
    
    // 获取原始数据
    const app = getApp();
    const yearlyData = app.globalData.resultData.yearlyData;
    
    // 准备数据
    const years = yearlyData.map(item => `第${item.year}年`);
    let annualSalary = [];
    
    // 根据模式调整数据
    if (mode === 'optimistic') {
      // 乐观模式：增长率提高20%
      const growthRate = this.data.inputData.growthRate / 100 * 1.2;
      const baseSalary = this.data.inputData.monthlySalary * 12;
      
      annualSalary = yearlyData.map((item, index) => {
        const optimisticSalary = baseSalary * Math.pow(1 + growthRate, index);
        return (optimisticSalary / 10000).toFixed(1);
      });
    } else if (mode === 'pessimistic') {
      // 保守模式：增长率降低20%
      const growthRate = this.data.inputData.growthRate / 100 * 0.8;
      const baseSalary = this.data.inputData.monthlySalary * 12;
      
      annualSalary = yearlyData.map((item, index) => {
        const pessimisticSalary = baseSalary * Math.pow(1 + growthRate, index);
        return (pessimisticSalary / 10000).toFixed(1);
      });
    } else {
      // 标准模式：使用原始数据
      annualSalary = yearlyData.map(item => (item.annual / 10000).toFixed(1));
    }
    
    // 更新图表
    chart.setOption({
      series: [{
        data: annualSalary
      }]
    });
  },

  backToInput: function() {
    wx.navigateBack();
  }
}); 