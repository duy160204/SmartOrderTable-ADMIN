import api from './api'

export const fileService = {
  async uploadFile(file) {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    
    return response.data
  },

  async deleteFile(filename) {
    await api.delete(`/files/${filename}`)
  },

  getFileUrl(filename) {
    return `${api.defaults.baseURL}/files/${filename}`
  }
}


