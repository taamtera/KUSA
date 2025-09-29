import dotenv from 'dotenv'
dotenv.config()
import nodemailer from 'nodemailer'

let transporter = nodemailer.createTransport
(
    {
        host: "scienceteam48036@gmail.com" // for testing only
        //
    }
)