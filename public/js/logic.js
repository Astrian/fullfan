

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
    console.log(res)
  }, res=>{
    alert('获取 AppKey 失败！')
  })
}
