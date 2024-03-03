const express = require("express");
const app = express();
app.use(express.json());
app.use(require("morgan")("dev"));

const {
  client,
  createTables,
  createCustomer,
  createRestaurant,
  createReservation,
  fetchCustomers,
  fetchReservations,
  fetchRestaurants,
  destroyReservation,
} = require("./db");

app.get("/api/customers", async (req, res, next) => {
  try {
    res.send(await fetchCustomers());
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/restaurants", async (req, res, next) => {
  try {
    res.send(await fetchRestaurants());
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/reservations", async (req, res, next) => {
  try {
    res.send(await fetchReservations());
  } catch (ex) {
    next(ex);
  }
});
app.delete(
  "/api/customers/:customer_id/reservations/:id",
  async (req, res, next) => {
    try {
      await destroyReservation(req.params.id);
      res.sendStatus(204);
    } catch (ex) {
      next(ex);
    }
  }
);

app.post("/api/customers/:id/reservations", async (req, res, next) => {
  const { date, party_count, customer_id, restaurant_id } = req.body;
  try {
    res
      .status(201)
      .send(
        await createReservation(date, party_count, customer_id, restaurant_id)
      );
  } catch (ex) {
    next(ex);
  }
});

app.use((err, req, res, next) => {
  res.status(500).send({ error: err.message });
});

async function init() {
  try {
    await client.connect();

    await createTables();
    const [Michael, Kemp, Torie, McDons, MrKings, Sandys, MachoBell] =
      await Promise.all([
        createCustomer("Michael"),
        createCustomer("Kemp"),
        createCustomer("Torie"),
        createRestaurant("McDons"),
        createRestaurant("Mr Kings"),
        createRestaurant("Sandys"),
        createRestaurant("Macho Bell"),
      ]);

    console.log("connected to the database");
    console.log(await fetchCustomers());
    console.log(await fetchRestaurants());
    const [reservation1, reservation2, reservation3] = await Promise.all([
      createReservation("2020-08-01", 3, Michael.id, McDons.id),
      createReservation("2020-08-02", 4, Kemp.id, MrKings.id),
      createReservation("2020-08-03", 5, Torie.id, Sandys.id),
    ]);
    await destroyReservation(reservation1.id);
    console.log(await fetchReservations());
    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`listening on port ${port}`));
  } catch (err) {
    console.error(err);
  }
}

init();
