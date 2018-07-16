<template>
    <div class="home">
        <div class='formBox'>
            <p class='title'>请起个互相认识的名字</p>
            <el-form :model="ruleForm" :rules='rules' status-icon ref="ruleForm" label-width="80px" size='small' label-suffix=':'>
              <el-form-item label="账号" prop="user">
                  <el-input v-model="ruleForm.user" auto-complete="off" style="width: 260px"></el-input>
              </el-form-item>

              <el-form-item label="密码" prop="pass">
                  <el-input type="password" v-model="ruleForm.pass" auto-complete="off" style="width: 260px"></el-input>
              </el-form-item>

              <el-form-item v-if="typeState=='login'?true:false">
                  <el-button type="primary" @click="loginSubmitForm('ruleForm')" class='login'>登录</el-button>
              </el-form-item>

              <el-form-item v-if="typeState=='register'?true:false">
                  <el-button type="primary" @click="registerSubmitForm('ruleForm')" class='login'>注册</el-button>
              </el-form-item>
              
            </el-form>
            <p class='toRegister' v-if="typeState=='login'?true:false" @click="goRegister('ruleForm')">注册账号</p>
            <p class='toRegister' v-if="typeState=='register'?true:false" @click="goLogin('ruleForm')">已有账号</p>
        </div>
    </div>
</template>

<script>
import {register,login} from '../api/index'

export default {
  name: 'Home',
  data () {
    const validatePass = (rule,value,callback)=>{
      const reg=/^[A-Za-z0-9]{6,20}$/;
      if(value===''){
        callback(new Error('请输入密码'));
      }else if(!reg.test(value)){
        callback(new Error('密码是 6 到 20 个数字字母组合'));
      }else{
        callback()
      }
    }
    return {
      ruleForm:{
        user:'',
        pass:''
      },
      rules:{
        user:[
          {required:true,message:'请输入账号',trigger: ['blur']}
        ],
        pass:[
          {required:true,validator: validatePass, trigger: 'blur'},
          { min: 6, max: 20, message: '密码是 6 到 20 个数字字母组合', trigger: 'blur' }
        ]
      },
      typeState:'login'
    }
  },
  methods:{
    goRegister(formName){
      this.typeState = 'register'
      this.$refs[formName].resetFields();
    },
    goLogin(formName){
      this.typeState = 'login'
      this.$refs[formName].resetFields();
    },
    registerSubmitForm(formName){
      this.$refs[formName].validate((valid)=>{
        if(valid){
          const {user,pass} = this.ruleForm;
          register(user,pass)
            .then((data)=>{
              if(data.code==200){
                this.$message.success(`${data.msg},请登录`);
                this.typeState = 'login';
                this.$refs[formName].resetFields();
              }else if(data.code==401){
                this.$message.warning(data.msg);
              }else{
                this.$message.error(`注册失败，联系我我`);
              }
            })
        }
      })
    },
    loginSubmitForm(formName){
      this.$refs[formName].validate((valid)=>{
        if(valid){
          const {user,pass} = this.ruleForm;
          login(user,pass)
            .then((data)=>{
              if(data.code==200){
                sessionStorage.setItem('chatToken',data.data.token);
                this.$message.success(data.msg);
                this.$router.push({path:'/chat'})
                this.$socket.emit('login',data.data.user)
              }else if(data.code==401){
                this.$message.warning(data.msg);
              }else{
                this.$message.error(`登录失败，联系我我`);
              }
            })
        }
      })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.home{
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  justify-content:center;
  align-items:center;
  background: url(../assets/bgimg.jpg) no-repeat fixed top;
}
.formBox{
  width: 500px;
  height: 400px;
}
.login{
  width: 258px;
}
.title{
  color: #EC2C2C;
  cursor: pointer;
  margin-left: 80px;
}
.toRegister{
  color: #606266;
  cursor: pointer;
  margin-left: 80px;
}
</style>
