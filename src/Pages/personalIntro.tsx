import React, { useState } from "react";
import { Layout, Menu, Avatar, Typography, Tag, Card, Switch } from "antd";
import { GithubOutlined, LinkedinOutlined, MailOutlined } from "@ant-design/icons";
import styles from "./personalIntro.module.css";
import avatar from "../assets/avatar.png";

const { Header, Content, Footer } = Layout;
const { Title, Paragraph } = Typography;

const Profile: React.FC = () => {

  const skills = ["Python" , "Pytroch", "Deep Learning" , "Embedded System","React", "Node.js", "MySQL"];

  const projects = [
    {
      title: "Spinal Lesions Classification",
      description: 
      ["• Design feature extractor encoder module",
      "• Conduct the whole experiment for representation learning",
      "• Keywords: Spinal Lesions, Radiograph, Pytorch"],
      link: "https://github.com/yourgithub/blog",
    },
    {
      title: "Korotkoff Sonar Blood Pressure Prediction",
      description: 
      ["• Build the Linux Embedded System on Raspberry Pi",
      "• Train the RNN/LSTM/GRU based model",
      "• Deploy model with quantization, pruning and clustering",
      "• Keywords: Blood Pressure, Pytorch, TensorFlow Lite"],
      link: "https://github.com/yourg,ithub/ecommerce-admin",
    },
    {
      title: "Edge-to-Photo Generation AI",
      description: 
      ["• Implement the dual-branch architecture Embedded GAN network",
        "• Develop a new method for noise generation",
        "• Keywords: Image-to-Image Generation, GAN, Pytorch",],
      link: "https://github.com/yourg,ithub/ecommerce-admin",
    },
    {
      title: "Vtorch: Graph-based Visual Interface for Pytorch",
      description: 
      ["• Using ReactFlow to generate the flow chart of ML pipeline",
        "• Design the frontend UI using the ReactJS",
        "• Design the backend database using NodeJS",
        "• Keywords: Explainable ML, Visualization , TypeScript"],
      link: "https://github.com/yourg,ithub/ecommerce-admin",
    },
    
  ];

  return (
    <Layout className={styles.layout}> 
      <Header className={styles.header} >
        <div className={styles.logo}>Profile</div>
      </Header>
      <Content className={styles.content}>
        <div className={styles.profile}>
          <Avatar size={120} src={avatar} />
          <Title level={1} className={styles.name}>Huang Baixiang</Title>
          <Title level={2} className={styles.section}>Education</Title>
          <Paragraph className={styles.bio}>Graduated From Hong Kong University of Science and Technology</Paragraph>
          <Paragraph className={styles.bio}>BEng in Computer Engineering</Paragraph>
        </div>

        <div className={styles.section}>
          <Title level={2}>Skills</Title>
          <div className={styles.tags}>
            {skills.map((skill) => (
              <Tag color="blue" key={skill}>{skill}</Tag>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <Title level={2}>Projects Experience</Title>
            <div className={styles.exp} >
                {projects.map((project) => (
                    <Card key={project.title} title={project.title} className={styles.card}>
                    {project.description.map((desc) => (
                        <Paragraph className={styles.content_card}>{desc}</Paragraph>
                    ))} 
                    <a href={project.link} target="_blank" rel="noopener noreferrer">
                        view more
                    </a>
                    </Card>
                ))}
            </div>
        </div>

        <div className={styles.section}>
          <Title level={2}>Social Links</Title>
          <div className={styles.socials}>
            <Card className={styles.round_card} hoverable>
              <a href="https://github.com/xiaoyuanzi22333" target="_blank" rel="noopener noreferrer">
                <GithubOutlined className={styles.icon} />
                <p>GitHub Link</p>
              </a>
            </Card>

            <Card className={styles.round_card} hoverable>
              <a href="mailto:xiaoyuanzi22333@gmail.com">
                <MailOutlined className={styles.icon} />
                <p>Email</p>
              </a>
            </Card>
          </div>
        </div>
      </Content>
      <Footer className={styles.footer}>
        © 2025 Huang Baixiang | Profile
      </Footer>
    </Layout>
  );
};

export default Profile;