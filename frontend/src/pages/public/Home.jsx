import React, { useEffect, useState } from "react";
import { apiRequest } from "../../services/api";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Zap,
  Droplets,
  Hammer,
  GraduationCap,
  Brush,
  Wrench,
  Car,
  PaintRoller,
  ShieldCheck,
  CreditCard,
  Headphones,
  Clock3,
  ThumbsUp,
  Users,
  Star,
  CalendarCheck,
  MapPin,
  ChevronDown,
} from "lucide-react";

import Navbar from "../../components/Navbar";
import ServiceCard from "../../components/ServiceCard";

const categories = [
  {
    name: "Electricians",
    count: "245 Professionals",
    icon: Zap,
    color: "yellow",
  },
  {
    name: "Plumbers",
    count: "192 Professionals",
    icon: Droplets,
    color: "blue",
  },
  {
    name: "Carpenters",
    count: "156 Professionals",
    icon: Hammer,
    color: "orange",
  },
  {
    name: "Tutors",
    count: "320 Professionals",
    icon: GraduationCap,
    color: "green",
  },
  {
    name: "Cleaners",
    count: "180 Professionals",
    icon: Brush,
    color: "purple",
  },
  {
    name: "AC Repair",
    count: "98 Professionals",
    icon: Wrench,
    color: "blue",
  },
  {
    name: "Mechanics",
    count: "134 Professionals",
    icon: Car,
    color: "red",
  },
  {
    name: "Painters",
    count: "117 Professionals",
    icon: PaintRoller,
    color: "teal",
  },
];

const trustItems = [
  {
    icon: ShieldCheck,
    title: "Verified Professionals",
    text: "All professionals are background verified",
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    text: "Pay safely using our secure payment gateway",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    text: "We are here to help you anytime",
  },
  {
    icon: Clock3,
    title: "On-Time Service",
    text: "Professional service delivery on time",
  },
  {
    icon: ThumbsUp,
    title: "Customer Satisfaction",
    text: "Thousands of happy customers",
  },
];

const stats = [
  {
    value: "10K+",
    label: "Happy Customers",
    icon: Users,
  },
  {
    value: "2K+",
    label: "Verified Professionals",
    icon: ShieldCheck,
  },
  {
    value: "15K+",
    label: "Completed Services",
    icon: CalendarCheck,
  },
  {
    value: "4.8",
    label: "Average Rating",
    icon: Star,
  },
];

function Home() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
const [servicesLoading, setServicesLoading] = useState(true);

useEffect(() => {
  const loadServices = async () => {
    try {
      const response = await apiRequest("/api/providers/services/public");
      setCategories(response.services || []);
    } catch (error) {
      console.error("Failed to load services:", error);
    } finally {
      setServicesLoading(false);
    }
  };

  loadServices();
}, []);

  return (
    <div className="nearhand-home">
      <Navbar />

      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="hero-overlay"></div>

        <div className="hero-content">
          <p className="hero-small-text">
            Trusted Services, Right Around You
          </p>

          <h1>
            Find Trusted
            <span>Local Professionals</span>
            Near You
          </h1>

          <p className="hero-description">
            Connect with verified experts for your home
            <br />
            and personal needs.
          </p>

         <button
  className="hero-button"
  onClick={() => navigate("/login")}
>
  Get Started
  <ArrowRight size={21} />
</button>
        </div>
      </section>

      {/* POPULAR CATEGORIES */}
      <section className="categories-section">
        <div className="section-heading">
          <h2>Popular Categories</h2>

          <a href="/services" className="view-all">
            View all categories
            <ArrowRight size={18} />
          </a>
        </div>

        <div className="categories-grid">
          {servicesLoading ? (
  <p>Loading services...</p>
) : (
  categories.slice(0, 8).map((category) => (
    <ServiceCard
      key={category.name}
      name={category.name}
      count={`${category.count} Professionals`}
      icon={
        {
          Electricians: Zap,
          Plumbers: Droplets,
          Carpenters: Hammer,
          Cleaners: Brush,
          "AC Repair": Wrench,
          Mechanics: Car,
          Painters: PaintRoller,
        }[category.name] || Wrench
      }
      color="green"
    />
  ))
)}
        </div>
      </section>

      {/* TRUST FEATURES */}
      <section className="trust-section">
        <div className="trust-container">
          {trustItems.map((item) => {
            const Icon = item.icon;

            return (
              <div className="trust-item" key={item.title}>
                <div className="trust-icon">
                  <Icon size={35} strokeWidth={2} />
                </div>

                <div className="trust-content">
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* STATISTICS */}
      <section className="stats-section">
        <div className="stats-container">
          {stats.map((stat, index) => {
            const Icon = stat.icon;

            return (
              <React.Fragment key={stat.label}>
                <div className="stat-item">
                  <Icon size={47} strokeWidth={1.8} />

                  <div>
                    <strong>{stat.value}</strong>
                    <span>{stat.label}</span>
                  </div>
                </div>

                {index !== stats.length - 1 && (
                  <div className="stat-divider"></div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default Home;