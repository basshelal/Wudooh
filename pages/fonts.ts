document.body.querySelectorAll(".collapsible").forEach((element: HTMLElement) => {
    element.onclick = () => {
        element.classList.toggle("active")
        const content: HTMLElement = element.nextElementSibling as HTMLElement
        if (content.style.maxHeight) content.style.maxHeight = null
        else content.style.maxHeight = content.scrollHeight + "px"
    }
})