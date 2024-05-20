import transporter from "$lib/emailSetup.server.js";

export const actions = {
    default: async ({ request }) => {
        try {
            const formData = await request.formData();
            const email = formData.get("to");
            const subject = formData.get("subject");
            const body = formData.get("body");
            console.log(body);
            let html = `<h2>Contactanos Carrito</h2><pre>${body}</pre>`;

            const message = {
                from: "testcarritoalan@gmail.com",
                to: email,
                bcc: "pesgard@gmail.com",
                subject: subject,
                text: body,
                html: html,
            };

            const sendEmail = async (message) => {
                await new Promise((resolve, reject) => {
                    transporter.sendMail(message, (err, info) => {
                        if (err) {
                            console.error(err);
                            reject(err);
                        } else {
                            resolve(info);
                        }
                    });
                });
            };

            await sendEmail(message);

            return {
                success: "Email is sent",
            };
        } catch (error) {
            console.error(error);
        }
    }
};