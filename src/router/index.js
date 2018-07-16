import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import Chat from '@/components/Chat'

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/chat',
      name: 'Chat',
      component: Chat
    }
  ]
})

router.beforeEach((to,from,next)=>{

  let toName = to.name;
  let fromName = from.name;
  let chatToken = sessionStorage.getItem('chatToken');

  if(!chatToken&&toName!=='Home'){
      next({
        name:'Home'
      })
  }else{
      if(chatToken&&!fromName){
        if(toName=='Home'){
            next({
              name:'Chat'
            })
            return;
        }else{
            next();
          return;
        }
      }

      next()
  }
})


export default router;
