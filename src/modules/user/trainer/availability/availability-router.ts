import { SmartRouter } from '../../../../openapi/smart-router.js';
import {
  createTrainerAvailability,
  getTrainerAvailabilities,
} from './availability-controller.js';

export const availabilityRouter = new SmartRouter(
  '/trainers/:trainerId/availabilities'
);

availabilityRouter.get('/', {}, getTrainerAvailabilities);

availabilityRouter.post('/', {}, createTrainerAvailability);
