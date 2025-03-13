Page({
  data: {
    jobs: ['程序员', '教师', '销售', '金融', '医疗'],
    jobIndex: 0,
    growthRates: [8, 5, 10, 7, 6], // 对应各职业的默认增长率
    salary: '',
    growthRate: 8, // 默认增长率
    years: 10 // 默认预测年限
  },

  onLoad: function() {
    // 页面加载时执行
  },

  bindJobChange: function(e) {
    const jobIndex = e.detail.value;
    this.setData({
      jobIndex: jobIndex,
      growthRate: this.data.growthRates[jobIndex]
    });
  },

  inputSalary: function(e) {
    this.setData({
      salary: e.detail.value
    });
  },

  sliderChange: function(e) {
    this.setData({
      growthRate: e.detail.value
    });
  },

  selectYears: function(e) {
    this.setData({
      years: parseInt(e.currentTarget.dataset.years)
    });
  },

  calculateFuture: function() {
    // 验证输入
    if (!this.data.salary) {
      wx.showToast({
        title: '请输入当前收入',
        icon: 'none'
      });
      return;
    }

    const salary = parseFloat(this.data.salary);
    if (isNaN(salary) || salary <= 0) {
      wx.showToast({
        title: '请输入有效的收入金额',
        icon: 'none'
      });
      return;
    }

    // 计算未来收入
    const monthlySalary = salary;
    const annualSalary = monthlySalary * 12;
    const growthRate = this.data.growthRate / 100;
    const years = this.data.years;
    const jobType = this.data.jobs[this.data.jobIndex];

    // 计算每年的收入
    const yearlyData = [];
    let keyPoints = [];
    
    for (let i = 0; i <= years; i++) {
      // 使用复合增长公式: 未来收入 = 当前收入 × (1 + 年增长率)^N年
      const futureAnnualSalary = annualSalary * Math.pow(1 + growthRate, i);
      const futureMonthlySalary = futureAnnualSalary / 12;
      
      yearlyData.push({
        year: i,
        annual: futureAnnualSalary,
        monthly: futureMonthlySalary
      });
      
      // 检测关键节点
      if (i > 0) {
        if (futureAnnualSalary >= annualSalary * 2 && keyPoints.length === 0) {
          keyPoints.push(`第${i}年收入将翻倍`);
        }
        
        // 检测是否突破30万年薪
        if (futureAnnualSalary >= 300000 && yearlyData[i-1].annual < 300000) {
          keyPoints.push(`第${i}年突破30万年薪`);
        }
      }
    }

    // 保存计算结果到全局数据
    const app = getApp();
    app.globalData.inputData = {
      jobType: jobType,
      monthlySalary: monthlySalary,
      growthRate: this.data.growthRate,
      years: years
    };
    
    app.globalData.resultData = {
      yearlyData: yearlyData,
      keyPoints: keyPoints
    };

    // 跳转到结果页面
    wx.navigateTo({
      url: '/pages/result/result'
    });
  }
}); 