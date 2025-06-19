This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, set up your environment variables:

1. Copy `.env.example` to a new file named `.env`
2. Generate a strong JWT secret:
   ```bash
   openssl rand -base64 32
   ```
3. Add this value to your `.env` file as `JWT_SECRET`
4. Image storage is now handled locally in the `/public/uploads/` directory

The application will not start without a properly configured JWT_SECRET.

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Monitoring & Resource Limits

The application includes built-in monitoring to help stay under free tier limits of various services.

### Free Tier Limits

| Limit                   | Free quota                  | How to stay safe                                            |
| ----------------------- | --------------------------- | ----------------------------------------------------------- |
| Edge Function execution | 100 GB-hours / mo           | Most real-estate traffic OK.                                |
| Build hours             | 1 h / mo                    | Don't trigger builds on every commit; use a develop branch. |
| Blob storage egress     | 100 GB / mo                 | Web-optimise images (already done).                         |
| Neon Postgres           | 3 GB data, 500 MB/mo egress | Archive old listing history or pay $0.25/GB overage.        |

### Setting Up Monitoring

The application has integrated monitoring in two ways:

1. **Sentry Error Tracking**: Already configured for error reporting and performance monitoring.

2. **UptimeRobot Monitoring**: 
   - Create a free account at [UptimeRobot](https://uptimerobot.com/)
   - Add a new monitor with type "HTTP(s)"
   - Use your site URL + `/api/system/health` as the endpoint (e.g., `https://your-site.com/api/system/health`)
   - Set check interval to 5 minutes
   - Save the monitor

### Admin Monitoring Dashboard

The application provides a monitoring dashboard for administrators at `/admin/monitoring`. This dashboard displays:

- System health status
- Resource usage against free tier limits
- Real-time memory and performance metrics
- Error testing tools

All alerts and warnings are automatically reported to Sentry when resource usage approaches limits.