const Tour = require('./../models/tourModel');

exports.getAllTours = async (req, res) => {
  try {
    const tours = await Tour.find();

    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: { tours },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    //Tours.findOne({_id: req.params.id})

    res.status(200).json({
      status: 'success',
      data: { tour },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
  // res.status(200).json({
  //   status: 'success',
  //   data: { tour },
  // });
};

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      data: { tour: newTour },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Invalid data sent!',
    });
  }
};

exports.updateTour = (req, res) => {
  // const id = req.params.id * 1;
  // Find the index of the tour to update
  // const tourIndex = tours.findIndex((el) => el.id === id);
  // Manually update the tour data by combining both the properties
  // const updatedTour = { ...tours[tourIndex], ...req.body };
  // Replace the old tour with the updated one in the array
  // tours[tourIndex] = updatedTour;
  // Save the updated tours array to the file
  // fs.writeFile(
  //   `${__dirname}/dev-data/data/tours-simple.json`,
  //   JSON.stringify(tours),
  //   (err) => {
  //     if (err) {
  //       return res.status(500).json({
  //         status: 'fail',
  //         message: 'Error writing file',
  //       });
  //     }
  //     res.status(200).json({
  //       status: 'success',
  //       data: { tour: updatedTour },
  //     });
  //   },
  // );
};

exports.deleteTour = (req, res) => {
  // const id = req.params.id * 1;
  // const tourIndex = tours.findIndex((el) => el.id === id);

  // tours.splice(tourIndex, 1);
  // fs.writeFile(
  //   `${__dirname}/dev-data/data/tours-simple.json`,
  //   JSON.stringify(tours),
  //   (err) => {
  //     if (err) {
  //       return res.status(500).json({
  //         status: 'fail',
  //         message: 'Error writing file',
  //       });
  //     }
  //   },
  // );
  res.status(204).json({
    status: 'success',
    data: null,
  });
};
