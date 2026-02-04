import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { User, GraduationCap, Mail, Linkedin } from "lucide-react";

const teamMembers = [
  {
    name: "Student Name 1",
    role: "Team Lead & ML Developer",
    email: "student1@university.edu",
    responsibilities: "Machine Learning implementation, Model training & evaluation",
  },
  {
    name: "Student Name 2",
    role: "Data Engineer",
    email: "student2@university.edu",
    responsibilities: "Data collection, preprocessing, and feature extraction",
  },
  {
    name: "Student Name 3",
    role: "NLP Specialist",
    email: "student3@university.edu",
    responsibilities: "Natural Language Processing, Text analysis modules",
  },
  {
    name: "Student Name 4",
    role: "Frontend Developer",
    email: "student4@university.edu",
    responsibilities: "UI/UX design, Dashboard development, Reporting system",
  },
];

const guide = {
  name: "Dr. Faculty Name",
  designation: "Associate Professor",
  department: "Department of Computer Science",
  email: "faculty@university.edu",
  expertise: "Machine Learning, Data Science, NLP",
};

const TeamSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="team" className="py-20 md:py-28">
      <div className="container mx-auto px-4" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-4">
            Team & Guide
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Meet Our Team
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            The dedicated team of students and faculty bringing this project to life.
          </p>
        </motion.div>

        {/* Project Guide */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-2xl mx-auto mb-12"
        >
          <div className="bg-gradient-to-r from-primary/10 to-accent/30 rounded-2xl p-8 border border-primary/20 text-center">
            <div className="w-24 h-24 rounded-full gradient-hero mx-auto mb-4 flex items-center justify-center shadow-glow">
              <GraduationCap className="w-12 h-12 text-primary-foreground" />
            </div>
            <h3 className="font-display font-bold text-2xl text-foreground mb-1">
              {guide.name}
            </h3>
            <p className="text-primary font-medium mb-1">{guide.designation}</p>
            <p className="text-muted-foreground text-sm mb-4">{guide.department}</p>
            <div className="flex items-center justify-center gap-4 text-sm">
              <a
                href={`mailto:${guide.email}`}
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span>{guide.email}</span>
              </a>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              <strong className="text-foreground">Expertise:</strong> {guide.expertise}
            </p>
          </div>
        </motion.div>

        {/* Team Members */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
              className="bg-card rounded-2xl p-6 shadow-md border border-border/50 hover:shadow-xl transition-all duration-300 group text-center"
            >
              <div className="w-20 h-20 rounded-full bg-accent mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <User className="w-10 h-10 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg text-foreground mb-1">
                {member.name}
              </h3>
              <p className="text-primary text-sm font-medium mb-3">{member.role}</p>
              <p className="text-muted-foreground text-xs leading-relaxed mb-4">
                {member.responsibilities}
              </p>
              <div className="flex items-center justify-center gap-3">
                <a
                  href={`mailto:${member.email}`}
                  className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                </a>
                <a
                  href="#"
                  className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Institution Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-12 text-center"
        >
          <p className="text-muted-foreground">
            <strong className="text-foreground">Institution:</strong> University Name
            <span className="mx-3">|</span>
            <strong className="text-foreground">Department:</strong> Computer Science & Engineering
            <span className="mx-3">|</span>
            <strong className="text-foreground">Batch:</strong> 2024-2025
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default TeamSection;
