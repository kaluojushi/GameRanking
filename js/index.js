const {Query, User} = AV;
AV.init({
  appId: "ELpotxI8WpWnIx5lziiXxgwD-gzGzoHsz",
  appKey: "Q7hqXBufFru5ARAxT35BwVwA",
  serverURL: "https://elpotxi8.lc-cn-n1-shared.com"
});

new Vue({
  el: '#app',
  data() {
    return {
      passwordOpen: false,
      activeIndex: '1',
      tableData: [],
      form: {
        pwd: ''
      },
      rules: {
        pwd: [{required: true, message: '请输入密码', trigger: 'blur'}]
      },
      password: ''
    }
  },
  created() {
    this.getScores();
    this.getPassword();
  },
  methods: {
    // 处理导航栏选择
    handleSelect(key, keyPath) {
      console.log(key);
    },

    // 处理冠亚季颜色
    tableRowClassName({row, rowIndex}) {
      switch (row.rank) {
        case 1:
          return 'success-row';
          break;
        case 2:
          return 'warning-row';
          break;
        case 3:
          return 'info-row';
          break;
      }
      return '';
    },

    // 读取文件
    load(path) {
      let xhr = new XMLHttpRequest();
      let okStatus = document.location.protocol === "file:" ? 0 : 200;
      xhr.open('GET', path, false);
      xhr.overrideMimeType("text/html;charset=utf-8");//默认为utf-8
      xhr.send(null);
      return xhr.status === okStatus ? xhr.responseText : null;
    },

    // 获取分数、分数排序
    getScores() {
      this.tableData = [];
      const queryAll = new AV.Query('Score');
      queryAll.find().then((rows) => {
        for (let row of rows) {
          let person = row.attributes;
          this.tableData.push({
            rank: 0,
            name: person.name,
            win: person.win,
            mvp: person.mvp,
            points: person.win + person.mvp,
            games: person.games
          });
        }
        this.sortScores();
      });
    },
    sortScores() {
      this.tableData.sort((a, b) => {
        if (b.points - a.points !== 0) {
          return b.points - a.points;
        } else {
          return a.games - b.games;
        }
      });
      if (this.tableData.length > 0) {
        this.tableData[0].rank = 1;
      }
      for (let i = 1; i < this.tableData.length; i++) {
        if (this.tableData[i].points === this.tableData[i - 1].points && this.tableData[i].games === this.tableData[i - 1].games) {
          this.tableData[i].rank = this.tableData[i - 1].rank;
        } else {
          this.tableData[i].rank = i + 1;
        }
      }
    },

    // 密码处理
    getPassword() {
      this.password = '';
      let string = this.load("../data/password.txt");
      this.password = string;
    },
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          if (this.form.pwd === this.password) {
            window.location.href = "admin.html";
            this.form.pwd = '';
            this.passwordOpen = false;
          } else {
            this.$alert('请重新输入密码', '密码错误', {
              confirmButtonText: '确定',
              type: 'warning'
            });
            this.form.pwd = '';
          }
        } else {
          return false;
        }
      });
    },
    cancelForm() {
      this.$refs.form.resetFields();
      this.form.pwd = '';
      this.passwordOpen = false;
    }
  }
});