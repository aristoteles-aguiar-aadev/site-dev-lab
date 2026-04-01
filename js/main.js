const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");
const logoTop = document.getElementById("logoTop");

if (logoTop) {
    logoTop.addEventListener("click", (event) => {
        event.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
}

if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", () => {
        const isOpen = mainNav.classList.toggle("mobile-open");
        menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    document.querySelectorAll("#mainNav a").forEach((link) => {
        link.addEventListener("click", () => {
            mainNav.classList.remove("mobile-open");
            menuToggle.setAttribute("aria-expanded", "false");
        });
    });

    document.addEventListener("click", (event) => {
        const clickedOutside =
            !mainNav.contains(event.target) && !menuToggle.contains(event.target);

        if (clickedOutside) {
            mainNav.classList.remove("mobile-open");
            menuToggle.setAttribute("aria-expanded", "false");
        }
    });
}

const contactModal = document.getElementById("contactModal");
const contactModalOverlay = document.getElementById("contactModalOverlay");
const openContactModalBtn = document.getElementById("openContactModal");
const closeContactModalBtn = document.getElementById("closeContactModal");
const contactForm = document.getElementById("contactForm");
const contactFormStatus = document.getElementById("contactFormStatus");
const contactFormSubmit = document.getElementById("contactFormSubmit");
const phoneInput = document.getElementById("phone");

function openContactModal() {
    if (!contactModal) return;

    contactModal.classList.add("active");
    contactModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
}

function closeContactModal() {
    if (!contactModal) return;

    contactModal.classList.remove("active");
    contactModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    clearStatus();
}

function setStatus(message, type) {
    if (!contactFormStatus) return;

    contactFormStatus.textContent = message;
    contactFormStatus.className = "contact-form__status";

    if (type) {
        contactFormStatus.classList.add(type === "error" ? "is-error" : "is-success");
    }
}

function clearStatus() {
    if (!contactFormStatus) return;

    contactFormStatus.textContent = "";
    contactFormStatus.className = "contact-form__status";
}

function setLoading(isLoading) {
    if (!contactFormSubmit) return;

    contactFormSubmit.disabled = isLoading;
    contactFormSubmit.textContent = isLoading ? "Enviando..." : "Enviar solicitação";
}

function normalizePayload(form) {
    const formData = new FormData(form);

    return {
        name: formData.get("name")?.toString().trim() || "",
        company: formData.get("company")?.toString().trim() || "",
        phone: formData.get("phone")?.toString().trim() || "",
        email: formData.get("email")?.toString().trim() || "",
        service: formData.get("service")?.toString().trim() || "",
        message: formData.get("message")?.toString().trim() || "",
        website: formData.get("website")?.toString().trim() || ""
    };
}

function applyPhoneMask(value) {
    const digits = value.replace(/\D/g, "").slice(0, 11);

    if (digits.length <= 10) {
        return digits
            .replace(/^(\d{2})(\d)/g, "($1) $2")
            .replace(/(\d{4})(\d)/, "$1-$2");
    }

    return digits
        .replace(/^(\d{2})(\d)/g, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2");
}

if (phoneInput) {
    phoneInput.addEventListener("input", (event) => {
        event.target.value = applyPhoneMask(event.target.value);
    });
}

if (openContactModalBtn) {
    openContactModalBtn.addEventListener("click", openContactModal);
}

if (closeContactModalBtn) {
    closeContactModalBtn.addEventListener("click", closeContactModal);
}

if (contactModalOverlay) {
    contactModalOverlay.addEventListener("click", closeContactModal);
}

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && contactModal?.classList.contains("active")) {
        closeContactModal();
    }
});

if (contactForm) {
    contactForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        clearStatus();

        if (!contactForm.reportValidity()) {
            return;
        }

        const payload = normalizePayload(contactForm);

        try {
            setLoading(true);

            const response = await fetch("/api/contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            /* const result = await response.json();

            if (!response.ok || !result.ok) {
                throw new Error(result.message || "Não foi possível enviar sua mensagem.");
            } */

            /* INICIO DE TESTE */
            let result = null;
            const contentType = response.headers.get("content-type") || "";

            if (contentType.includes("application/json")) {
                result = await response.json();
            } else {
                const raw = await response.text();
                throw new Error(raw || "A API não retornou JSON.");
            }

            if (!response.ok || !result.ok) {
                throw new Error(result.message || "Não foi possível enviar sua mensagem.");
            }
            /* FIM DE TESTE */

            setStatus("Mensagem enviada com sucesso. Em breve entrarei em contato.", "success");
            contactForm.reset();

            setTimeout(() => {
                closeContactModal();
            }, 1400);
        } catch (error) {
            setStatus(error.message || "Falha ao enviar. Tente novamente em instantes.", "error");
        } finally {
            setLoading(false);
        }
    });
}