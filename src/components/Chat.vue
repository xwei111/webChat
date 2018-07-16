<template>
    <div class="chat">
        <p class='title' @click="onEditorFocus">webChat</p>
        <ul class='ul' id='ul' @click="onEditorFocus">
          <li v-for="(item,index) in chatInfo" :key='index' class='li'>
            <div :class="item.user==chatuser?'rihgtChat':'leftChat'">
                <div class='leftbox'>
                  <p :class="item.user==chatuser?'fr':'fl'"><span class='time'>{{item.time}}</span><span class='name'>{{item.user}}</span></p>
                </div>
                <div class='leftbox' style='padding-top:4px'>
                  <img :class="item.user==chatuser?'fr mr':'fl ml'" :src="item.img" />
                  <div class="triangle_border_right" :class="item.message==undefined?'hide':item.user==chatuser?'':'hide'"></div>
                  <div class="triangle_border_left" :class="item.message==undefined?'hide':item.user==chatuser?'hide':''"></div>
                  <p :class="item.user==chatuser?'fr':'fl'" style='padding-top:2px'><span class='message' v-if="item.message!=undefined">{{item.message}}</span><img class='sendimg' v-if="item.sendimg!=undefined" :src='item.sendimg' /></p>
                </div>
            </div>
            
          </li>
        </ul>

        <div id="toolbar" class='toolbar'>
           
          <img class='smile' src='../assets/Smile.png' @click='emoticonShow' />

          <el-upload
            :action="imgurl"
            list-type="picture-card"
            :show-file-list="showlist"
            class='upload'
            :on-success='hanldeSuccess'
            >
            <img class='upimg' src='../assets/upimg.png' @click='onEditorFocus'  />
          </el-upload>
          
        </div>
        <div class='editorBox' @click="onEditorFocus">
          <!-- 表情包 -->
          <transition name="fade">
            <div v-if="ifShow" class='emoticonBox'>
              
                <img class='emoj' v-for="(item,index) in emicon" :key="index" :src="item" :data-name='item'  @click="selectemoj"  />
              
            </div>
          </transition>

          <quill-editor 
            class='editor'
            v-model="content" 
            ref="myQuillEditor" 
            :options="editorOption" 
            @change="onEditorChange($event)"
            >
          
          </quill-editor>

          <p class='sendtalk' @click="sendData">发送</p>

        </div>
        
    </div>
</template>

<script>
import jwt from 'jsonwebtoken'
import qs from 'qs'
import {searchChatcontent,getEmoticon} from '../api/index'
import * as Quill from 'quill'

export default {
  name: 'Chat',
  data () {
    var that = this;
    var url = process.env.API_HOST+'/uploadImg'
    return {
      chatuser:'',
      sendata:'',
      parentUl:'',
      chatInfo:[],
      chatimg:'',
      editorOption:{
        debug: 'info',
        modules: {
          toolbar:'#toolbar',
          keyboard:{
            bindings:{
              list: {
                key: 'enter',
                handler: function(range, context) {
                  that.sendData()
                }
              }
            }
            
          }
        },
        placeholder: '请输入......',
        readOnly: true,
        theme: 'snow'
      },
      content:'',
      sendata:'',
      showlist:false,
      ifShow:false,
      emicon:[],
      imgurl:url,
      ulscrollHeight:''
    }
  },
  created(){
    var that = this;
    jwt.verify(sessionStorage.getItem('chatToken'), 'secret', function(err, decoded) {
      if (!err) {
          that.chatuser = decoded.user;
          that.chatimg = decoded.img;
      }
    })

    searchChatcontent()
      .then((data)=>{
        this.chatInfo = data
      })
    
    getEmoticon()
      .then((data)=>{
        if(data.code==200){
          this.emicon = data.emotion
        }
      })

  },
  mounted(){
    this.$options.sockets.chating=(data)=>{
        this.chatInfo.push(data)
    }
    
    this.ulscrollHeight = document.getElementById('ul').scrollHeight;
    
  },
  watch:{
    ulscrollHeight(val,oldvl){
      setTimeout(function(){
        document.getElementById('ul').scrollTop = val+100000;//更新滚动条
      },500)
      
    }
  },
  sockets:{
    connect:function(){
      console.log('socketvue')
    },
    customEmit:function(val){
      console.log('val',val)
    }
  },
  methods:{
    sendData:function(){
      var sendata = this.sendata;
      var len =sendata.length;
      
      if(len==0){
        this.$message.warning('发送信息不能为空');
      }else{
        for(let vl of sendata){
          if(typeof vl == 'object'){
            var obj = {user:this.chatuser,sendimg:vl.insert.image,img:this.chatimg}
            this.$socket.emit('chating', obj);
          }else{
            var mobj={user:this.chatuser,message:vl,img:this.chatimg} 
            this.$socket.emit('chating',mobj );
          }
        }
      }

      this.sendata='';
      this.content='';
    },
    onEditorChange(e){
      var ops = e.quill.editor.delta.ops;
      var len = ops.length;

      var sendataContent=[];
      for(var m=0;m<len;m++){
        if(typeof ops[m].insert == 'object'){
          sendataContent.push(ops[m])
        }else{
          if(ops[m].insert!='\n'){
            var ifk=true;
            var re=/\n/g;
            var ist = ops[m].insert;
            ist = ist.replace(re,"");
            var istLen = ist.length;
            for(var n=0;n<istLen;n++){
              if(ist[n]!=' '){
                ifk=false
              }
            }
            if(!ifk){
              sendataContent.push(ist)
            }
          }
        }
      }
      this.sendata = sendataContent;
    },
    onEditorFocus(){
      this.ifShow=false
    },
    emoticonShow(){
      this.ifShow=!this.ifShow
    },
    selectemoj(e){
      
      this.ifShow=!this.ifShow
      var emname=e.target.getAttribute('data-name');

      this.insertImg(emname)
    },
    hanldeSuccess(response, file, fileList){
      if(response.code==200){
        var imgUrl = response.result;
        this.insertImg(imgUrl)
      }else{
        this.$message.warning(response.message);
      }
    },
    insertImg(img){
      var quill = this.$refs.myQuillEditor.quill;
      quill.focus();//聚焦
      let length;
      // 获取光标位置
      if(quill.getSelection()){
        length=quill.getSelection().index
      }else{
        length=0;
      }
      // // 插入图片 

      quill.insertEmbed(length, 'image', img, Quill.sources.USER)
      // 调整光标到最后
      quill.setSelection(length + 1)
    }
  },
  updated: function(){
      this.ulscrollHeight = document.getElementById('ul').scrollHeight;
      document.getElementById('ul').scrollTop = document.getElementById('ul').scrollHeight;//更新滚动
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.title{
  position: fixed;
  height: 50px;
  width: 100%;
  line-height: 50px;
  text-align: center;
  font-size: 24px;
  font-weight: 900;
  color: #3AA668;
  background: rgba(0,0,0,0.2);
  z-index: 1;
}
.chat{
  position: absolute;
  width: 100%;
  height: 100%;
  background: url(../assets/chatbg.jpg) no-repeat fixed top;
  top: 0;
  left: 0;
}
.ul{
  width: 100%;
  height: 75%;
  overflow-x: hidden;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}
.li{
  width: 100%;
  margin-bottom: 15px;
}
.li:first-child{
  margin-top: 60px;
}
.li:last-child{
  margin-bottom: 20px;
}
.rihgtChat{
  float: right;
  margin-right: 20px;
  display: flex;
  flex-direction: column;
}
.leftChat{
  float: left;
  margin-left: 20px;
  display: flex;
  flex-direction: column;
}
.leftbox{
  position: relative;
}
.time{
  float: left;
  color: #3AA668;
  margin-right: 10px;
}
.name{
  float: left;
  color: #3AA668;
}
.message{
  float: left;
  max-width: 350px;
  background: #AAD9BE;
  padding: 7px;
  border-radius: 5px;
  word-wrap:break-word
}
.fl{
  float: left;
}
.fr{
  float: right;
}
.mr{
  margin-left: 15px;
  height: 40px;
  width: 40px;
  border-radius: 50%;
}
.ml{
  margin-right: 15px;
  height: 40px;
  width: 40px;
  border-radius: 50%;
}
.hide{
  display: none;
}
.triangle_border_right{
  position: absolute;
  top: 10px;
  right:42px;
  content: "";
  width: 0;
  height: 0;
  border-top: 15px solid #AAD9BE;
  border-right: 15px solid transparent;
}
.triangle_border_left{
  position: absolute;
  top: 10px;
  left:42px;
  content: "";
  width: 0;
  height: 0;
  border-top: 15px solid #AAD9BE;
  border-left: 15px solid transparent;
}
.editorBox{
  position: relative;
  width: 100%;
  height: 20%;
}
.sendtalk{
  position: absolute;
  bottom: 7px;
  right: 7px;
  height: 30px;
  width: 60px;
  text-align: center;
  line-height: 30px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background: #3AA668;
  cursor: pointer;
}
.editor{
  width: 100%;
  height: 100%;
}
.toolbar{
  width: 100%;
  height: 5%;
  display: flex;
  flex-direction: row;
  position: relative;
}
.smile{
  height: 20px;
  width: 20px;
  cursor: pointer;
  position: relative;
  bottom:2px;
}
.upload{
  position: absolute;
  z-index: 1;
  top: -52px;
  left: 20px;
}
.upimg{
  height: 20px;
  width: 20px;
  cursor: pointer;
  margin-left: 10px;
  margin-top: -1px;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity .2s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
.emoticonBox{
  position: absolute;
  height: 280px;
  width: 280px;
  border: 1px solid #ccc;
  top: -317px;
  left: 10px;
  background: #fff;
  box-shadow: 1px -1px 1px #ccc;
  border-radius: 4px;
  overflow-x: hidden;
  overflow-y: auto;
}
.emoj{
  max-width: 68px;
  float: left;
}
.sendimg{
  max-width: 100px;
}
</style>
