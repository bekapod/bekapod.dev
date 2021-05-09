export default {
  widgets: [
    {
      name: 'sanity-tutorials',
      options: {
        templateRepoId: 'sanity-io/sanity-template-eleventy-blog'
      }
    },
    {name: 'structure-menu'},
    {
      name: 'project-info',
      options: {
        __experimental_before: [
          {
            name: 'netlify',
            options: {
              description:
                'NOTE: Because these sites are static builds, they need to be re-deployed to see the changes when documents are published.',
              sites: [
                {
                  buildHookId: '6097cb987bf753720d4bad99',
                  title: 'Sanity Studio',
                  name: 'bekapod-dev-studio',
                  apiId: 'a16f5507-b07c-4852-8b6e-613d04e04a2d'
                },
                {
                  buildHookId: '6097cb98e8d9485db8a7598e',
                  title: 'Blog Website',
                  name: 'bekapod-dev',
                  apiId: '1ded98cc-4828-4d79-bbce-b27ae9ebcb91'
                }
              ]
            }
          }
        ],
        data: [
          {
            title: 'GitHub repo',
            value: 'https://github.com/bekapod/bekapod.dev',
            category: 'Code'
          },
          {title: 'Frontend', value: 'https://bekapod-dev.netlify.app', category: 'apps'}
        ]
      }
    },
    {name: 'project-users', layout: {height: 'auto'}},
    {
      name: 'document-list',
      options: {title: 'Recent blog posts', order: '_createdAt desc', types: ['post']},
      layout: {width: 'medium'}
    }
  ]
}
