export function getPropertyStore() {
  if (!this.store) {
    this.store = PropertiesService.getScriptProperties()
  }
  return this.store
}

export const getProperty = propertyName => getPropertyStore().getProperty(propertyName) || ''
