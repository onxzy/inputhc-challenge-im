import nodemailer from 'nodemailer';

export const mailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'hostname',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: Boolean(parseInt(process.env.SMTP_SECURE || '0')),
  auth: {
    user: process.env.SMTP_USER || 'username',
    pass: process.env.SMTP_PASSWORD || 'password',
  },
  // logger: true
})

// export const mailTransporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST || 'localhost',
//   port: process.env.SMTP_PORT || '25',
//   secure: process.env.SMTP_SECURE || false,
//   requireTLS: true,
//   auth: {
//     user: process.env.SMTP_USER || 'user',
//     pass: process.env.SMTP_PASSWORD || 'password',
//   },
//   logger: true
// });

// export { mailTransporter };
