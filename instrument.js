// Import with `import * as Sentry from "@sentry/node"` if you are using ESM
import * as Sentry from '@sentry/node'
import { nodeProfilingIntegration } from '@sentry/profiling-node'

Sentry.init({
    dsn: 'https://206167d976427a076edc28fe70d58f7a@o4511535603122176.ingest.us.sentry.io/4511687072350208',
    dataCollection: {
        // To disable sending user data and HTTP bodies, uncomment the lines below. For more info visit:
        // https://docs.sentry.io/platforms/javascript/guides/node/configuration/options/#dataCollection
        // userInfo: false,
        // httpBodies: [],
    },
    integrations: [nodeProfilingIntegration()],
    // Performance Monitoring
    tracesSampleRate: 1.0, // This means send 100% of requests to Sentry (for testing)
    profilesSampleRate: 1.0, // Send 100% of profiling data
})
