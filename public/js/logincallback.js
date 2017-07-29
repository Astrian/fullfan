function getUrlParam(name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
  var r = window.location.search.substr(1).match(reg); //匹配目标参数
  if (r != null) return unescape(r[2]);
  return null; //返回参数值
}

var app = new Vue({
  el: '#module',
  data: {
  },
  methods: {
    requestLogin(){
      requestLogin()
    }
  }
})
function requestLogin(){
  app.$http.post('/interface/postLoginRequest', {
    oauth_token = getUrlParam('oauth_token')
  }).then(res=>{
    window.location.href='https://fanfou.com/oauth/authorize?oauth_token='+res.body.data.oauth_token+'&oauth_callback='+url;
  }, res=>{
    alert('获取 AppKey 失败！')
  })
}