// 前端特有的schmeas
import * as schemas from './schemas';

export interface WebTimeslot extends schemas.TimeslotRead {
  webonly?: boolean;
}
