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
