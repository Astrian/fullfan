var app = new Vue({
  el: '#module',
  data: {},
  methods: {
    login(){
      console.log('executed the login()')
      this.$http.post('/interface/postLoginRequset', {
        oauth_token : getUrlParam('oauth_token')
      }).then(res=>{
        console.log(res)
    }, res=>{
        console.log(res)
        alert('获取资料失败！')
      })
    }
  }
})

function getUrlParam(name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
  var r = window.location.search.substr(1).match(reg); //匹配目标参数
  if (r != null) return unescape(r[2]);
  return null; //返回参数值
}