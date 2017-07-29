var url = 'http://localhost:3000/logincallback/'

var app = new Vue({
  el: '#module',
  data: {
  },
  methods: {
    getAppKey(){
      getAppKey()
    }
  }
})
function getAppKey(){
  app.$http.get('/interface/getRequestToken').then(res=>{
    window.location.href='https://fanfou.com/oauth/authorize?oauth_token='+res.body.data.oauth_token+'&oauth_callback='+url;
  }, res=>{
    alert('获取 AppKey 失败！')
  })
}
