import { useConfigStore } from '../stores/config'

export default {
  install(app) {
    const configStore = useConfigStore()

    // Initialize config on app mount
    configStore.fetchConfigs()
  }
}