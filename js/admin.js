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
      // 几个弹窗的打开
      userManageOpen: false,
      userAddOpen: false,
      userEditOpen: false,
      gameInputOpen: false,
      settingOpen: false,
      pwdChangeOpen: false,
      // 基本数据
      tableData: [],
      userForm: {
        id: '',
        name: '',
        win: 0,
        mvp: 0,
        games: 0
      },
      userRules: {
        name: [{required: true, message: '请输入姓名', trigger: 'blur'}],
        win: [{required: true, message: '请输入获胜次数', trigger: 'blur'}],
        mvp: [{required: true, message: '请输入MVP次数', trigger: 'blur'}],
        games: [{required: true, message: '请输入游戏场数', trigger: 'blur'}]
      },
      gameInputForm: {
        player: [],
        winner: [],
        mvper: []
      },
      peopleNames: [],
      gameInputRules: {
        player: [{type: 'array', required: true, message: '请选择本场玩家', trigger: 'change'}],
        winner: [{type: 'array', required: true, message: '请选择本场获胜者', trigger: 'change'}]
      },
      pwdChangeForm: {
        oldPwd: '',
        newPwd: ''
      },
      pwdChangeRules: {
        oldPwd: [{required: true, message: '请输入旧密码', trigger: 'blur'}],
        newPwd: [{required: true, message: '请输入新密码', trigger: 'blur'}],
      }
    }
  },
  created() {
    // this.getScores();
  },
  methods: {
    // 返回首页
    goBack() {
      window.location.href = "index.html";
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

    // 人员管理
    userManage() {
      this.userManageOpen = true;
      this.getScores();
    },
    userAdd() {
      this.userAddOpen = true;
    },
    cancelUserAdd() {
      this.$refs.userAdd.resetFields();
      this.userForm.name = '';
      this.userAddOpen = false;
    },
    submitUserAdd() {
      this.$refs.userAdd.validate((valid) => {
        if (valid) {
          const Score = AV.Object.extend('Score');
          const person = new Score;
          person.set('name', this.userForm.name);
          person.set('win', 0);
          person.set('mvp', 0);
          person.set('games', 0);
          person.save().then((res) => {
            this.$message({
              type: 'success',
              message: '新增成功!'
            });
            this.userForm.name = '';
            this.userAddOpen = false;
            this.getScores();
          });
        } else {
          return false;
        }
      });
    },
    userEdit(row) {
      const userQuery = new AV.Query('Score');
      userQuery.equalTo('name', row.name);
      userQuery.first().then((row) => {
        this.userForm = {
          id: row.id,
          name: row.get('name'),
          win: row.get('win'),
          mvp: row.get('mvp'),
          games: row.get('games')
        };
        this.userEditOpen = true;
      });
    },
    cancelUserEdit() {
      this.$refs.userEdit.resetFields();
      this.userForm = {
        id: '',
        name: '',
        win: 0,
        mvp: 0,
        games: 0
      };
      this.userEditOpen = false;
    },
    submitUserEdit() {
      this.$refs.userEdit.validate((valid) => {
        if (valid) {
          const userQuery = new AV.Query('Score');
          userQuery.get(this.userForm.id).then((row) => {
            row.set('name', this.userForm.name);
            row.set('win', this.userForm.win);
            row.set('mvp', this.userForm.mvp);
            row.set('games', this.userForm.games);
            row.save().then((res) => {
              this.$message({
                type: 'success',
                message: '修改成功!'
              });
              this.userForm = {
                id: '',
                name: '',
                win: 0,
                mvp: 0,
                games: 0
              };
              this.userEditOpen = false;
              this.getScores();
            });
          });
        } else {
          return false;
        }
      });
    },
    userDelete(row) {
      this.$confirm('此操作将删除该用户, 是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const userQuery = new AV.Query('Score');
        userQuery.equalTo('name', row.name);
        userQuery.first().then((row) => {
          row.destroy();
          row.save().then((res) => {
            this.getScores();
            this.$message({
              type: 'success',
              message: '删除成功!'
            });
          });
        });
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });
      });
    },
    userReset(row) {
      this.$confirm('此操作将重置该用户游戏数据, 是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const userQuery = new AV.Query('Score');
        userQuery.equalTo('name', row.name);
        userQuery.first().then((row) => {
          row.set('win', 0);
          row.set('mvp', 0);
          row.set('games', 0);
          row.save().then((res) => {
            this.getScores();
            this.$message({
              type: 'success',
              message: '重置成功!'
            });
          });
        });
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消重置'
        });
      });
    },
    finishUserManage() {
      this.userManageOpen = false;
    },

    // 游戏录入
    gameInput() {
      this.gameInputOpen = true;
      this.peopleNames = [];
      const nameQuery = new AV.Query('Score');
      nameQuery.find().then((rows) => {
        for (let row of rows) {
          this.peopleNames.push(row.get('name'));
        }
      });
    },
    cancelGameInput() {
      this.$refs.gameInputForm.resetFields();
      this.gameInputForm = {
        player: [],
        winner: [],
        mvper: []
      };
      this.gameInputOpen = false;
    },
    submitGameInput() {
      this.$refs.gameInputForm.validate((valid) => {
        if (valid) {
          const objects = [];
          const userQuery = new AV.Query('Score');
          userQuery.containedIn('name', this.gameInputForm.player);
          userQuery.find().then((rows) => {
            for (let row of rows) {
              row.set('games', row.get('games') + 1);
              objects.push(row);
            }
            userQuery.containedIn('name', this.gameInputForm.winner);
            userQuery.find().then((rows) => {
              for (let row of rows) {
                row.set('win', row.get('win') + 1);
                objects.push(row);
              }
              userQuery.containedIn('name', this.gameInputForm.mvper);
              userQuery.find().then((rows) => {
                for (let row of rows) {
                  row.set('mvp', row.get('mvp') + 1);
                  objects.push(row);
                }
                console.log(objects);
                AV.Object.saveAll(objects).then((res) => {
                  this.$message({
                    type: 'success',
                    message: '录入成功!'
                  });
                  this.gameInputForm = {
                    player: [],
                    winner: [],
                    mvper: []
                  };
                  this.gameInputOpen = false;
                });
              });
            });
          });
        } else {
          return false;
        }
      });
    },


    // 系统管理
    setting() {
      this.settingOpen = true;
    },
    pwdChange() {
      this.pwdChangeOpen = true;
    },
    cancelPwdChange() {
      this.$refs.pwdChangeForm.resetFields();
      this.pwdChangeForm = {
        oldPwd: '',
        newPwd: ''
      };
      this.pwdChangeOpen = false;
    },
    submitPwdChange() {
      this.$refs.pwdChangeForm.validate((valid) => {
        if (valid) {
          const pwdQuery = new AV.Query('System');
          pwdQuery.equalTo('key', 'password');
          pwdQuery.first().then((row) => {
            const oldPwd = row.get('value');
            if (this.pwdChangeForm.oldPwd !== oldPwd) {
              this.$alert('请重新输入密码', '旧密码错误', {
                confirmButtonText: '确定',
                type: 'warning'
              });
              this.pwdChangeForm = {
                oldPwd: '',
                newPwd: ''
              };
            } else if (this.pwdChangeForm.oldPwd === this.pwdChangeForm.newPwd) {
              this.$alert('请重新输入密码', '新旧密码一致', {
                confirmButtonText: '确定',
                type: 'warning'
              });
              this.pwdChangeForm = {
                oldPwd: '',
                newPwd: ''
              };
            } else {
              row.set('value', this.pwdChangeForm.newPwd);
              row.save().then((res) => {
                this.$message({
                  type: 'success',
                  message: '修改成功!'
                });
                this.pwdChangeForm = {
                  oldPwd: '',
                  newPwd: ''
                };
                this.pwdChangeOpen = false;
              });
            }
          });
        } else {
          return false;
        }
      });
    },
    finishSetting() {
      this.settingOpen = false;
    }
  }
});