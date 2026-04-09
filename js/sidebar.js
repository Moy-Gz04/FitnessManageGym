fetch('components/sidebar.html')
    .then(res => res.text())
    .then(data => {
        document.getElementById('sidebar-container').innerHTML = data;

        // Activar link actual automáticamente
        const links = document.querySelectorAll('.menu-item');
        const current = window.location.pathname.split("/").pop();

        links.forEach(link => {
            if (link.getAttribute("href") === current) {
                link.classList.add("active");
            }
        });
    });