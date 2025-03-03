import React from "react";
import { Avatar, Typography, Tag, Card } from "antd";
import { GithubOutlined, MailOutlined } from "@ant-design/icons";
import styles from "./personalIntro.module.css";
import avatar from "../../assets/avatar.png"; // 引入图片路径


const { Title, Paragraph } = Typography;

const Profile: React.FC = () => {
  const skills = [
    "Python",
    "Pytorch",
    "Deep Learning",
    "Embedded System",
    "React",
    "Node.js",
    "MySQL",
  ];

  const projects = [
    {
      title: "Spinal Lesions Classification",
      description: [
        "• Designed a feature extractor encoder module.",
        "• Conducted experiments for representation learning.",
        "• Keywords: Spinal Lesions, Radiograph, Pytorch.",
      ],
      link: "https://github.com/yourgithub/blog",
    },
    {
      title: "Sonar Blood Pressure Prediction",
      description: [
        "• Built a Linux Embedded System on Raspberry Pi.",
        "• Trained RNN/LSTM/GRU-based models.",
        "• Deployed models with quantization, pruning, and clustering.",
        "• Keywords: Blood Pressure, Pytorch, TensorFlow Lite.",
      ],
      link: "https://github.com/yourgithub/ecommerce-admin",
    },
    {
      title: "Edge-to-Photo Generation AI",
      description: [
        "• Implemented embedded GAN with dual-branch architecture.",
        "• Developed a new method for noise generation.",
        "• Keywords: Image-to-Image Generation, GAN, Pytorch.",
      ],
      link: "https://github.com/yourgithub/ecommerce-admin",
    },
    {
      title: "Vtorch: Visual Interface for Pytorch",
      description: [
        "• Used ReactFlow to generate ML pipeline flowcharts.",
        "• Designed the frontend UI using ReactJS.",
        "• Designed the backend database using NodeJS.",
        "• Keywords: Explainable ML, Visualization, TypeScript.",
      ],
      link: "https://github.com/yourgithub/ecommerce-admin",
    },
  ];

  return (
    <div className={styles.container}>
      {/* Header Section */}
      <header className={styles.header}>
        <h1 className={styles.headerTitle}>Profile</h1>
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        {/* Avatar and Bio Section */}
        <section className={styles.bioSection}>
          <Avatar
            size={120}
            src={avatar}
            alt="Avatar"
            className={styles.avatar}
          />
          <Title level={2} className={styles.name}>
            Huang Baixiang
          </Title>
          <Paragraph className={styles.education}>
            BEng in Computer Engineering
          </Paragraph>
          <Paragraph className={styles.education}>
            Graduated from HKUST
          </Paragraph>
        </section>

        {/* Skills Section */}
        <section className={styles.section}>
          <Title level={3} className={styles.sectionTitle}>
            Skills
          </Title>
          <div className={styles.skills}>
            {skills.map((skill) => (
              <Tag key={skill} className={styles.skillTag}>
                {skill}
              </Tag>
            ))}
          </div>
        </section>

        {/* Projects Section */}
        <section className={styles.section}>
          <Title level={3} className={styles.sectionTitle}>
            Projects Experience
          </Title>
          <div className={styles.projects}>
            {projects.map((project) => (
              <Card
                key={project.title}
                title={project.title}
                className={styles.projectCard}
                hoverable
              >
                {project.description.map((desc, index) => (
                  <Paragraph key={index} className={styles.projectDesc}>
                    {desc}
                  </Paragraph>
                ))}
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.projectLink}
                >
                  View more
                </a>
              </Card>
            ))}
          </div>
        </section>

        {/* Social Links Section */}
        <section className={styles.section}>
          <Title level={3} className={styles.sectionTitle}>
            Social Links
          </Title>
          <div className={styles.socialLinks}>
            <Card hoverable className={styles.socialCard}>
              <a
                href="https://github.com/xiaoyuanzi22333"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
              >
                <GithubOutlined className={styles.socialIcon} />
                <p>GitHub</p>
              </a>
            </Card>
            <Card hoverable className={styles.socialCard}>
              <a
                href="mailto:xiaoyuanzi22333@gmail.com"
                className={styles.socialLink}
              >
                <MailOutlined className={styles.socialIcon} />
                <p>Email</p>
              </a>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer Section */}
      <footer className={styles.footer}>
        © 2025 Huang Baixiang | Profile
      </footer>
    </div>
  );
};

export default Profile;