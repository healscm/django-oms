<template>
  <div class="components-container" style='height:100vh'>
    <el-card>
      <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px">
        <el-form-item label="转移">
          <el-radio v-model="copy" label="dev">研发</el-radio>
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="ruleForm.name" placeholder="请输入名称"></el-input>
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <mavon-editor style="z-index: 1" v-model="ruleForm.content" code_style="monokai"
                        :toolbars="toolbars" @imgAdd="imgAdd" ref="md"></mavon-editor>
          <a class="tips"> Tip：截图可以直接 Ctrl + v 粘贴到内容里面</a>
        </el-form-item>
        <el-form-item label="附件">
          <el-upload
            ref="upload"
            :action="uploadurl"
            :show-file-list="false"
            :before-upload="beforeAvatarUpload">
            <el-button slot="trigger" size="mini" type="success" plain :disabled="count>4">
              上传
            </el-button>
            <div slot="tip" class="el-upload__tip">
              <p><a style="color: red">最多只能上传5个文件</a></p>
            </div>
          </el-upload>
          <hr class="heng"/>
          <div v-if='enclosureData.length>0' class="ticketenclosure">
            <ul>
              <li v-for="item in enclosureData" :key="item.id" v-if="item.file" style="list-style:none">
                <i class="fa fa-paperclip"></i>
                <a :href="apiurl + '/upload/' + item.file" :download="item.file">{{item.file.split('/')[1]}}</a>
                <el-tooltip class="item" effect="dark" content="删除附件" placement="right">
                  <el-button type="text" icon="el-icon-delete" @click="deleteEnclosure(item.id)"></el-button>
                </el-tooltip>
              </li>
            </ul>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="copyWorkticket">提交</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>
<script>
import {
  getWorkticket,
  postTicketenclosure,
  getTicketenclosure,
  deleteTicketenclosure,
  postTicketcomment,
  patchWorkticket
} from 'api/workticket'
import { postDemandManager, postDemandEnclosure } from '@/api/project'
import { postopsDemandManager, postopsDemandEnclosure } from '@/api/optask'
import { postUpload, postSendmessage } from 'api/tool'
import { apiUrl, uploadurl } from '@/config'
import { getConversionTime } from '@/utils'
import { getUser } from 'api/user'

export default {
  components: {},

  data() {
    return {
      route_path: this.$route.path.split('/'),
      pid: this.$route.params.pid,
      ruleForm: {},
      rules: {
        name: [
          { required: true, message: '请输入正确的内容', trigger: 'blur' }
        ],
        content: [
          { required: true, message: '请输入正确的内容', trigger: 'blur' }
        ]
      },
      copy: 'dev',
      users: [],
      toolbars: {
        preview: true, // 预览
        bold: true, // 粗体
        italic: true, // 斜体
        header: true, // 标题
        underline: true, // 下划线
        strikethrough: true, // 中划线
        ol: true, // 有序列表
        help: true
      },
      apiurl: apiUrl,
      uploadurl: uploadurl,
      types: [],
      img_file: {},
      count: 0,
      enclosureData: [],
      enclosureForm: {
        project: '',
        create_user: localStorage.getItem('username'),
        file: ''
      },
      commentForm: {
        ticket: '',
        create_user: localStorage.getItem('username'),
        content: '本工单已经被转成需求'
      }
    }
  },

  created() {
    this.fetchData()
    this.fetchEnclosureData()
  },
  methods: {
    fetchData() {
      const parms = {
        pid: this.pid
      }
      getWorkticket(parms).then(response => {
        this.ruleForm = response.data[0]
      })
    },
    resetForm(formName) {
      this.$refs[formName].resetFields()
    },
    imgAdd(pos, file) {
      var md = this.$refs.md
      const formData = new FormData()
      formData.append('username', localStorage.getItem('username'))
      formData.append('file', file)
      formData.append('create_time', getConversionTime(file.lastModified))
      formData.append('type', file.type)
      formData.append('archive', this.route_path[1])
      postUpload(formData).then(response => {
        md.$imglst2Url([[pos, response.data.file]])
      })
    },
    beforeAvatarUpload(file) {
      const formData = new FormData()
      formData.append('username', this.enclosureForm.create_user)
      formData.append('file', file)
      formData.append('create_time', getConversionTime())
      formData.append('type', file.type)
      formData.append('archive', this.route_path[1])
      postUpload(formData).then(response => {
        this.enclosureForm.file = response.data.filepath
        this.enclosureForm.ticket = this.ruleForm.id
        postTicketenclosure(this.enclosureForm)
        if (response.statusText === 'Created') {
          this.$message({
            type: 'success',
            message: '恭喜你，上传成功'
          })
        }
        this.fetchEnclosureData()
      }).catch(error => {
        this.$message.error('上传失败')
        this.$refs.upload.clearFiles()
        console.log(error)
      })
      return true
    },
    fetchEnclosureData() {
      const parms = {
        ticket__pid: this.pid
      }
      getTicketenclosure(parms).then(response => {
        this.enclosureData = response.data
      })
    },
    deleteEnclosure(id) {
      deleteTicketenclosure(id)
      this.fetchEnclosureData()
    },
    copyWorkticket() {
      const DemandForm = {
        pid: this.ruleForm.pid,
        name: this.ruleForm.name,
        content: this.ruleForm.content,
        type: '来自工单',
        create_user: this.ruleForm.create_user,
        create_time: this.ruleForm.create_time
      }
      if (this.copy === 'op') {
        postopsDemandManager(DemandForm).then(response => {
          this.$message({
            type: 'success',
            message: '恭喜你，转移成功'
          })
          if (this.enclosureData.length > 0) {
            for (const item of this.enclosureData) {
              const Demandenclosure = {
                project: response.data.id,
                file: item.file,
                create_user: item.create_user,
                create_time: item.create_time
              }
              postopsDemandEnclosure(Demandenclosure)
            }
          }
          const messageForm = {
            action_user: 'admin',
            title: '【新需求】' + DemandForm.name,
            message: `需求创建人: ${DemandForm.create_user}`
          }
          postSendmessage(messageForm)
          this.$router.push('/opstasks/opsdemands')
        }).catch(error => {
          const errordata = JSON.stringify(error.response.data)
          this.$message.error(errordata)
        })
      } else {
        postDemandManager(DemandForm).then(response => {
          this.$message({
            type: 'success',
            message: '恭喜你，转移成功'
          })
          if (this.enclosureData.length > 0) {
            for (const item of this.enclosureData) {
              const Demandenclosure = {
                project: response.data.id,
                file: item.file,
                create_user: item.create_user,
                create_time: item.create_time
              }
              postDemandEnclosure(Demandenclosure)
            }
          }
          const pramas = {
            groups__name: 'OMS_Dev_Manager'
          }
          getUser(pramas).then(uu => {
            const users = uu.data
            for (const user of users) {
              const messageForm = {
                action_user: user.username,
                title: '【新需求】' + DemandForm.name,
                message: `操作人: ${DemandForm.create_user}地址: http://${window.location.host}/#/projects/viewdemand/${response.data.id}`
              }
              postSendmessage(messageForm)
            }
          })
          //          const messageForm = {
          //            action_user: 'omar',
          //            title: '【新需求】' + DemandForm.name,
          //            message: `需求创建人: ${DemandForm.create_user}`
          //          }
          //          postSendmessage(messageForm)
          this.$router.push('/projects/demands')
        }).catch(error => {
          const errordata = JSON.stringify(error.response.data)
          this.$message.error(errordata)
          console.log(errordata)
        })
      }
      this.commentForm.ticket = this.ruleForm.id
      postTicketcomment(this.commentForm)
      const data = {
        ticket_status: 1
      }
      patchWorkticket(this.ruleForm.id, data)
    }
  }
}
</script>

<style lang='scss'>
</style>
