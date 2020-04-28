document.body.querySelectorAll(".collapsible").forEach((element) => {
    element.onclick = () => {
        element.classList.toggle("active");
        const content = element.nextElementSibling;
        if (content.style.maxHeight)
            content.style.maxHeight = null;
        else
            content.style.maxHeight = content.scrollHeight + "px";
    };
});
