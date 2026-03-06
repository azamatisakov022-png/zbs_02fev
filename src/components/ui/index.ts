import { App } from 'vue'

const modules = import.meta.glob('./**/*.vue', {
    eager: true,
})

export default {
    install(app: App) {
        Object.entries(modules).forEach(([path, module]: any) => {
            const component = module.default
            if (!component?.name) {
                // eslint-disable-next-line no-console
                console.warn(`Component at ${path} is missing a name`)
                return
            }

            app.component(component.name, component)
        })
    },
}

export { default as AppButton } from './AppButton.vue'
export { default as AppInput } from './AppInput.vue'
export { default as AppBadge } from './AppBadge.vue'
export { default as AppCard } from './AppCard.vue'
export { default as AppTable } from './AppTable.vue'
export { default as AppPageHeader } from './AppPageHeader.vue'
export { default as AppAlert } from './AppAlert.vue'
export { default as AppTabs } from './AppTabs.vue'
export { default as AppModal } from './AppModal.vue'
export { default as AppSelect } from './AppSelect.vue'
export { default as AppCtaBanner } from './AppCtaBanner.vue'
export { default as AppStatCard } from './AppStatCard.vue'
export { default as AppToggleSwitch } from './AppToggleSwitch.vue'
export { default as AppInfoRow } from './AppInfoRow.vue'
export { default as AppTooltip } from './AppTooltip.vue'
export { default as AppActionMenu } from './AppActionMenu.vue'
