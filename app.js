const fs = require('fs');

const express = require('express');

const app = express();
app.use(express.json());

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

//// Handling GET request ////

app.get('/api/v1/tours', (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: { tours },
  });
});

// Handling GET request with route parameters by using req.params
// :y? makes y optional
// :id is a route parameter
//find method returns the first element that satisfies the condition
//
app.get('/api/v1/tours/:id/', (req, res) => {
  console.log(req.params);
  const id = req.params.id * 1;
  const tour = tours.find((el) => el.id === id);

  if (!tour) {
    res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
    return;
  }


  res.status(200).json({
    status: 'success',
    data: { tour },
  });
});

//// Handling POST request with adding middle ware to parse JSON data with express.json() by accessing req.body////

app.post('/api/v1/tours', (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);
  tours.push(newTour);

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      if (err) {
        return res.status(500).json({
          status: 'fail',
          message: 'Error writing file',
        });
      }
      res.status(201).json({
        status: 'success',
        data: { tour: newTour },
      });
    }
  );
});


app.patch('/api/v1/tours/:id', (req, res) => {
  const id = req.params.id * 1;

  // Find the index of the tour to update
  const tourIndex = tours.findIndex((el) => el.id === id);

  if (tourIndex === -1) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }

  // Manually update the tour data by combining both the properties
  const updatedTour = { ...tours[tourIndex], ...req.body };

  // Replace the old tour with the updated one in the array
  tours[tourIndex] = updatedTour;

  // Save the updated tours array to the file
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      if (err) {
        return res.status(500).json({
          status: 'fail',
          message: 'Error writing file',
        });
      }

      res.status(200).json({
        status: 'success',
        data: { tour: updatedTour },
      });
    }
  );
});



const port = 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});
