const cars = [
    {
        id: 1,
        make: "Toyota",
        model: "Camry SE",
        year: 2023,
        price: 27500,
        mileage: 28400,
        transmission: "Automatic",
        fuel: "Gasoline",
        location: "USA",
        city: "Texas",
        image: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=900&q=80",
        color: "White",
        drivetrain: "Front-Wheel Drive",
        description: "Well-maintained Toyota Camry SE with excellent fuel economy and a comfortable interior."
    },
    {
        id: 2,
        make: "BMW",
        model: "330i",
        year: 2022,
        price: 34900,
        mileage: 31200,
        transmission: "Automatic",
        fuel: "Gasoline",
        location: "Canada",
        city: "Ontario",
        image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=900&q=80",
        color: "Black",
        drivetrain: "Rear-Wheel Drive",
        description: "Sporty BMW 330i with premium interior, smooth performance and modern technology."
    },
    {
        id: 3,
        make: "Tesla",
        model: "Model 3",
        year: 2024,
        price: 38500,
        mileage: 12800,
        transmission: "Automatic",
        fuel: "Electric",
        location: "USA",
        city: "California",
        image: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=900&q=80",
        color: "Red",
        drivetrain: "All-Wheel Drive",
        description: "Low-mileage Tesla Model 3 with electric performance, modern technology and a clean interior."
    }
];


function displayCars(carList = cars) {
    const carGrid = document.querySelector(".car-grid");

    if (!carGrid) {
        return;
    }

    if (carList.length === 0) {
        carGrid.innerHTML = `
            <p style="grid-column: 1 / -1; text-align: center;">
                No cars found.
            </p>
        `;
        return;
    }

    carGrid.innerHTML = carList.map(function(car) {
        return `
            <article class="car-card" data-car-id="${car.id}">
                <div class="car-image">
                    <img 
                        src="${car.image}" 
                        alt="${car.year} ${car.make} ${car.model}"
                    >
                </div>

                <div class="car-info">
                    <p class="car-year">${car.year}</p>

                    <h3>${car.make} ${car.model}</h3>

                    <p class="car-details">
                        ${car.mileage.toLocaleString()} miles •
                        ${car.transmission} •
                        ${car.fuel}
                    </p>

                    <div class="car-bottom">
                        <strong>${car.price.toLocaleString()}</strong>
                        <span>${car.city}, ${car.location}</span>
                    </div>

                    <button class="view-details-btn" type="button" data-car-id="${car.id}">
                        View Details
                    </button>
                </div>
            </article>
        `;
    }).join("");

    carGrid.querySelectorAll(".view-details-btn").forEach(function(button) {
        button.addEventListener("click", function(event) {
            event.stopPropagation();
            openCarDetails(Number(button.dataset.carId));
        });
    });

    carGrid.querySelectorAll(".car-card").forEach(function(card) {
        card.addEventListener("click", function(event) {
            if (event.target.closest(".view-details-btn")) {
                return;
            }

            openCarDetails(Number(card.dataset.carId));
        });
    });
}


function searchCars() {
    const makeElement = document.getElementById("make");
    const modelElement = document.getElementById("model");
    const priceElement = document.getElementById("price");
    const locationElement = document.getElementById("location");

    const make = makeElement ? makeElement.value : "";
    const model = modelElement ? modelElement.value.toLowerCase().trim() : "";
    const price = priceElement ? priceElement.value : "";
    const location = locationElement ? locationElement.value : "";

    const results = cars.filter(function(car) {

        const matchesMake =
            !make || car.make === make;

        const matchesModel =
            !model || car.model.toLowerCase().includes(model);

        const matchesPrice =
            !price || car.price <= Number(price);

        const matchesLocation =
            !location ||
            (location === "United States" && car.location === "USA") ||
            (location === "Canada" && car.location === "Canada");

        return (
            matchesMake &&
            matchesModel &&
            matchesPrice &&
            matchesLocation
        );
    });

    displayCars(results);
}


function openCarDetails(carId) {
    const car = cars.find(function(item) {
        return item.id === carId;
    });

    if (!car) return;

    const detailsWindow = document.createElement("div");
    detailsWindow.style.cssText = "position:fixed;inset:0;z-index:999999;background:rgba(0,0,0,.85);display:flex;align-items:center;justify-content:center;padding:20px;overflow:auto;";

    detailsWindow.innerHTML = `
        <div style="position:relative;background:#fff;color:#111;width:100%;max-width:850px;max-height:90vh;overflow:auto;border-radius:16px;padding:30px;">
            <button id="closeCarDetails" type="button" style="position:absolute;right:15px;top:15px;width:42px;height:42px;border:0;border-radius:50%;font-size:28px;cursor:pointer;background:#eee;">×</button>
            <img src="${car.image}" alt="${car.year} ${car.make} ${car.model}" style="width:100%;height:350px;object-fit:cover;border-radius:10px;">
            <p style="color:#e63946;font-weight:800;margin-top:20px;">${car.year}</p>
            <h2 style="font-size:34px;margin:5px 0;">${car.make} ${car.model}</h2>
            <h3 style="color:#e63946;font-size:26px;">${car.price.toLocaleString()}</h3>
            <p><strong>Mileage:</strong> ${car.mileage.toLocaleString()} miles</p>
            <p><strong>Transmission:</strong> ${car.transmission}</p>
            <p><strong>Fuel:</strong> ${car.fuel}</p>
            <p><strong>Color:</strong> ${car.color}</p>
            <p><strong>Drivetrain:</strong> ${car.drivetrain}</p>
            <p><strong>Location:</strong> ${car.city}, ${car.location}</p>
            <h3>Vehicle Description</h3>
            <p>${car.description}</p>
        </div>
    `;

    document.body.appendChild(detailsWindow);

    detailsWindow.querySelector("#closeCarDetails").addEventListener("click", function() {
        detailsWindow.remove();
    });

    detailsWindow.addEventListener("click", function(event) {
        if (event.target === detailsWindow) detailsWindow.remove();
    });
}

document.addEventListener("DOMContentLoaded", function() {
    displayCars();
});