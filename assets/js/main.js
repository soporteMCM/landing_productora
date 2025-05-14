document.addEventListener("DOMContentLoaded", function () {
    const pageable = new Pageable("#container", {
        // Opciones de Pageable
        childSelector: "[data-anchor]", // Selector para las páginas
        animation: 500, // Duración de la animación en ms
        delay: 0, // Retraso entre animaciones
        orientation: "vertical", // Orientación de desplazamiento (horizontal o vertical)
        swipeThreshold: 50, // Umbral para detectar deslizamientos
        freeScroll: false, // Desplazamiento libre o por página
        navPrevEl: false, // Elemento para navegación previa
        navNextEl: false, // Elemento para navegación siguiente
        infinite: false, // Desplazamiento infinito
        events: {
            wheel: true, // Habilitar eventos de rueda
            mouse: false, // Habilitar eventos de mouse
            touch: true, // Habilitar eventos táctiles
            keydown: true // Habilitar eventos de teclado
        },
        easing: function (currentTime, startPos, endPos, interval) {
            currentTime /= interval / 2
            if (currentTime < 1)
                return (endPos / 2) * currentTime * currentTime * currentTime + startPos
            currentTime -= 2
            return (endPos / 2) * (currentTime * currentTime * currentTime + 2) + startPos
        },
        onFinish: function (data) {
            document.querySelectorAll(".nav-link").forEach((link) => {
                link.classList.remove("active")
                if (link.getAttribute("href") === "#" + data.anchor) {
                    link.classList.add("active")
                }
            })
        }
    })
    const contactForm = document.getElementById("contactForm")

    if (contactForm) {
        contactForm.addEventListener("submit", function (e) {
            e.preventDefault()

            // Obtener los campos del formulario
            const nameInput = document.getElementById("name")
            const phoneInput = document.getElementById("phone")
            const emailInput = document.getElementById("email")
            const messageInput = document.getElementById("message")

            // Validación básica
            let isValid = true

            if (nameInput.value.trim() === "") {
                highlightField(nameInput, true)
                isValid = false
            } else {
                highlightField(nameInput, false)
            }

            if (phoneInput.value.trim() === "") {
                highlightField(phoneInput, true)
                isValid = false
            } else {
                highlightField(phoneInput, false)
            }

            if (emailInput.value.trim() === "" || !isValidEmail(emailInput.value)) {
                highlightField(emailInput, true)
                isValid = false
            } else {
                highlightField(emailInput, false)
            }

            if (messageInput.value.trim() === "") {
                highlightField(messageInput, true)
                isValid = false
            } else {
                highlightField(messageInput, false)
            }

            // Si el formulario es válido, mostrar mensaje de éxito
            // En un caso real, aquí se enviaría el formulario a un servidor
            if (isValid) {
                showFormSuccess()
                contactForm.reset()
            }
        })
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }

    function highlightField(field, isError) {
        if (isError) {
            field.classList.add("is-invalid")
            field.classList.remove("is-valid")
        } else {
            field.classList.remove("is-invalid")
            field.classList.add("is-valid")
        }
    }

    function showFormSuccess() {
        const formContainer = document.querySelector(".contact-form-card")
        const successAlert = document.createElement("div")

        successAlert.className = "alert alert-success mt-3"
        successAlert.role = "alert"
        successAlert.innerHTML =
            "¡Mensaje enviado con éxito! Nos pondremos en contacto contigo a la brevedad."

        formContainer.appendChild(successAlert)

        setTimeout(() => {
            successAlert.remove()
        }, 5000)
    }

    document.querySelectorAll(".nav-link").forEach((link) => {
        link.addEventListener("click", function (e) {
            e.preventDefault()
            const target = this.getAttribute("href").substring(1)
            pageable.scrollToAnchor(target)
        })
    })
})
