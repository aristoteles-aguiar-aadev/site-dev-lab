function escapeHtml(value = "") {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default async function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).json({
            ok: false,
            message: "Método não permitido.",
        });
    }

    try {
        if (!process.env.RESEND_API_KEY) {
            return res.status(500).json({
                ok: false,
                message: "RESEND_API_KEY não configurada na Vercel.",
            });
        }

        if (!process.env.CONTACT_TO_EMAIL) {
            return res.status(500).json({
                ok: false,
                message: "CONTACT_TO_EMAIL não configurado na Vercel.",
            });
        }

        if (!process.env.CONTACT_FROM_EMAIL) {
            return res.status(500).json({
                ok: false,
                message: "CONTACT_FROM_EMAIL não configurado na Vercel.",
            });
        }

        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);

        const body = req.body || {};

        const name = String(body.name || "").trim();
        const company = String(body.company || "").trim();
        const phone = String(body.phone || "").trim();
        const email = String(body.email || "").trim();
        const service = String(body.service || "").trim();
        const message = String(body.message || "").trim();
        const website = String(body.website || "").trim();

        if (website) {
            return res.status(200).json({
                ok: true,
                message: "Recebido.",
            });
        }

        if (!name || !phone || !email || !message) {
            return res.status(400).json({
                ok: false,
                message: "Preencha nome, telefone, e-mail e mensagem.",
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({
                ok: false,
                message: "Informe um e-mail válido.",
            });
        }

        const safeName = escapeHtml(name);
        const safeCompany = escapeHtml(company || "-");
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
            <h2>Novo contato pelo site</h2>
  
            <table style="border-collapse: collapse; width: 100%; max-width: 720px;">
              <tr>
                <td style="padding: 10px; border: 1px solid #e5e7eb; width: 180px;"><strong>Nome</strong></td>
                <td style="padding: 10px; border: 1px solid #e5e7eb;">${safeName}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #e5e7eb;"><strong>Empresa</strong></td>
                <td style="padding: 10px; border: 1px solid #e5e7eb;">${safeCompany}</td>
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
        });

        if (error) {
            console.error("Erro do Resend:", error);

            return res.status(500).json({
                ok: false,
                message: error.message || "Erro ao enviar pelo Resend.",
            });
        }

        return res.status(200).json({
            ok: true,
            message: "Mensagem enviada com sucesso.",
            id: data?.id || null,
        });
    } catch (error) {
        console.error("Erro geral na API /api/contact:", error);

        return res.status(500).json({
            ok: false,
            message: error?.message || "Erro interno na API /api/contact.",
        });
    }
}