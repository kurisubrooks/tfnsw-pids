import { StationScroll } from './StationScroll';
import '../assets/styles/StationScroll.scss';

export const ServiceView = ({ services, stops, departure }) => {
  return (
    <div className="scrollView">
      <div className="scrollContainer">
        <StationScroll type={services[0]?.type} stops={stops} />
      </div>
      <div className="infoContainer">
        {services[0]?.platform && <>
          <div className="titlePair">
            <div className="title">{services[0]?.platform?.title}</div>
            <div className="value">{services[0]?.platform?.value}</div>
          </div>
        </>}
        {services[0]?.id && <>
          <div className="titlePair">
            <div className="title">Departs</div>
            <div className="value">{departure}</div>
          </div>
        </>}
      </div>
    </div>
  );
};
