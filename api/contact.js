import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function json(data, init = {}) {
    const headers = new Headers(init.headers || {});
    headers.set("Content-Type", "application/json; charset=utf-8");

    return new Response(JSON.stringify(data), {
        ...init,
        headers
    });
}

function escapeHtml(value = "") {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default {
    async fetch(request) {
        if (request.method !== "POST") {
            return json(
                { ok: false, message: "Método não permitido." },
                {
                    status: 405,
                    headers: {
                        Allow: "POST"
                    }
                }
            );
        }

        try {
            if (!process.env.RESEND_API_KEY) {
                return json(
                    { ok: false, message: "RESEND_API_KEY não configurada." },
                    { status: 500 }
                );
            }

            if (!process.env.CONTACT_TO_EMAIL || !process.env.CONTACT_FROM_EMAIL) {
                return json(
                    { ok: false, message: "E-mails do contato não configurados." },
                    { status: 500 }
                );
            }

            const body = await request.json();

            const name = String(body?.name || "").trim();
            const company = String(body?.company || "").trim();
            const phone = String(body?.phone || "").trim();
            const email = String(body?.email || "").trim();
            const service = String(body?.service || "").trim();
            const message = String(body?.message || "").trim();
            const website = String(body?.website || "").trim();

            if (website) {
                return json({ ok: true, message: "Recebido." });
            }

            if (!name || !phone || !email || !message) {
                return json(
                    { ok: false, message: "Preencha nome, telefone, e-mail e mensagem." },
                    { status: 400 }
                );
            }

            if (!isValidEmail(email)) {
                return json(
                    { ok: false, message: "Informe um e-mail válido." },
                    { status: 400 }
                );
            }

            const safeName = escapeHtml(name);
            const safeCompany = escapeHtml(company);
            const safePhone = escapeHtml(phone);
            const safeEmail = escapeHtml(email);
            const safeService = escapeHtml(service || "Não informado");
            const safeMessage = escapeHtml(message).replaceAll("\n", "<br />");

            const { data, error } = await resend.emails.send({
                from: process.env.CONTACT_FROM_EMAIL,
                to: [process.env.CONTACT_TO_EMAIL],
                replyTo: email,
                subject: `Novo lead do site - ${name}`,
                html: `
          <div style="font-family: Arial, Helvetica, sans-serif; color: #111; line-height: 1.6;">
            <h2 style="margin-bottom: 16px;">Novo contato pelo site</h2>

            <table style="border-collapse: collapse; width: 100%; max-width: 720px;">
              <tr>
                <td style="padding: 10px; border: 1px solid #e5e7eb; width: 180px;"><strong>Nome</strong></td>
                <td style="padding: 10px; border: 1px solid #e5e7eb;">${safeName}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #e5e7eb;"><strong>Empresa</strong></td>
                <td style="padding: 10px; border: 1px solid #e5e7eb;">${safeCompany || "-"}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #e5e7eb;"><strong>Telefone</strong></td>
                <td style="padding: 10px; border: 1px solid #e5e7eb;">${safePhone}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #e5e7eb;"><strong>E-mail</strong></td>
                <td style="padding: 10px; border: 1px solid #e5e7eb;">${safeEmail}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #e5e7eb;"><strong>Serviço</strong></td>
                <td style="padding: 10px; border: 1px solid #e5e7eb;">${safeService}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #e5e7eb; vertical-align: top;"><strong>Mensagem</strong></td>
                <td style="padding: 10px; border: 1px solid #e5e7eb;">${safeMessage}</td>
              </tr>
            </table>
          </div>
        `,
                text: `
Novo contato pelo site

Nome: ${name}
Empresa: ${company || "-"}
Telefone: ${phone}
E-mail: ${email}
Serviço: ${service || "Não informado"}

Mensagem:
${message}
        `.trim()
            });

            if (error) {
                console.error("Resend error:", error);
                return json(
                    { ok: false, message: "Não foi possível enviar seu contato agora." },
                    { status: 500 }
                );
            }

            return json({
                ok: true,
                message: "Mensagem enviada com sucesso.",
                id: data?.id || null
            });
        } catch (error) {
            console.error("Contact API error:", error);

            return json(
                { ok: false, message: "Erro interno ao processar o envio." },
                { status: 500 }
            );
        }
    }
};