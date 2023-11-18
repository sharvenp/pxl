let ipcAPI = (channel: string, ...data: any) => {
  //@ts-ignore
  if (window.ipcAPI) {
    //@ts-ignore
    window.ipcAPI.call(channel, ...data)
  }
}

let ipcAPISupported = () => {
  //@ts-ignore
  if (window.ipcAPI) {
    return true;
  }
  return false;
}

export { ipcAPI, ipcAPISupported } ;