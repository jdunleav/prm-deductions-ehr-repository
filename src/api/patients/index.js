import express from 'express';
import { authenticateRequest } from '../../middleware/auth';
import { validate } from '../../middleware/validation';
import { patientDetails } from './patient-details';
import { patientHealthRecords, patientHealthRecordsValidation } from './patient-health-records';
import { patientFragments, patientFragmentsValidation } from './patient-fragments';

const patients = express.Router();

patients.get('/', authenticateRequest, patientDetails);
patients.get(
  '/:nhsNumber/health-records',
  authenticateRequest,
  patientHealthRecordsValidation,
  validate,
  patientHealthRecords
);
patients.get(
  '/:nhsNumber/health-records/fragments',
  authenticateRequest,
  patientFragmentsValidation,
  validate,
  patientFragments
);

export { patients };
