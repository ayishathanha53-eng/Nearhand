import React, { useEffect, useState } from "react";
import { apiRequest } from "../../services/api";
import {
  Zap,
  Droplets,
  Hammer,
  GraduationCap,
  Brush,
  Wrench,
  Car,
  PaintRoller,
} from "lucide-react";

import ServiceCard from "../../components/ServiceCard";



function Services() {

  const [services, setServices] = useState([]);
const [servicesLoading, setServicesLoading] = useState(true);

useEffect(() => {
  const loadServices = async () => {
    try {
      const response = await apiRequest("/api/providers/services/public");
      setServices(response.services || []);
    } catch (error) {
      console.error("Failed to load services:", error);
    } finally {
      setServicesLoading(false);
    }
  };

  loadServices();
}, []);
  return (
    <div className="inner-page">

      <section className="page-hero services-hero">
        <div>
          <p className="page-label">OUR SERVICES</p>

          <h1>
            Find the Right Service
            <span>Near You</span>
          </h1>

          <p>
            Explore trusted local professionals and choose
            the service that fits your needs.
          </p>
        </div>
      </section>

      <section className="services-page-content">

        <div className="services-heading">
          <h2>Popular Services</h2>

          <p>
            Choose from a wide range of professional services.
          </p>
        </div>

       
<div className="services-grid">
  {servicesLoading ? (
    <p>Loading services...</p>
  ) : (
    services.map((service) => (
      <ServiceCard
        key={service.name}
        name={service.name}
        count={`${service.count} Professionals`}
        icon={
          {
            Electricians: Zap,
            Plumbers: Droplets,
            Carpenters: Hammer,
            Cleaners: Brush,
            "AC Repair": Wrench,
            Mechanics: Car,
            Painters: PaintRoller,
          }[service.name] || Wrench
        }
        color="green"
      />
    ))
  )}
</div>


      </section>
    </div>
  );
}

export default Services;