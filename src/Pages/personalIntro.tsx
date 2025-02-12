import React, { useState } from "react";
import { Layout, Menu, Avatar, Typography, Tag, Card, Switch } from "antd";
import { GithubOutlined, LinkedinOutlined, MailOutlined } from "@ant-design/icons";
import styles from "./personalIntro.module.css";

const { Header, Content, Footer } = Layout;
const { Title, Paragraph } = Typography;

const Profile: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);

  const skills = ["React", "TypeScript", "JavaScript", "CSS", "Node.js", "Ant Design", "GraphQL"];

  const projects = [
    {
      title: "个人博客",
      description: "使用 Next.js 和 Markdown 构建的个人博客系统。",
      link: "https://github.com/yourgithub/blog",
    },
    {
      title: "电商管理系统",
      description: "基于 React 和 Ant Design 的后台管理系统。",
      link: "https://github.com/yourgithub/ecommerce-admin",
    },
  ];

  return (
    <Layout>
      <Header className={styles.header}>
        <div className={styles.logo}>Profile</div>
      </Header>
      <Content className={styles.content}>
        <div className={styles.profile}>
          <Avatar size={120} src="https://via.placeholder.com/120" />
          <Title level={2} className={styles.name}>Huang Baixiang</Title>
          <Paragraph className={styles.bio}>
          Hong Kong University of Science and Technology,
          BEng in Computer Engineering
          </Paragraph>
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
          <Title level={3}>项目经历</Title>
            <div className={styles.exp} >
                {projects.map((project) => (
                    <Card key={project.title} title={project.title} className={styles.card}>
                    <Paragraph>{project.description}</Paragraph>
                    <a href={project.link} target="_blank" rel="noopener noreferrer">
                        查看项目
                    </a>
                    </Card>
                ))}
                <Card key="123" title="123" className={styles.card}>
                <Paragraph>123123</Paragraph>
                <a  target="_blank" rel="noopener noreferrer">
                    查看项目
                </a>
                </Card>
            </div>
        </div>

        <div className={styles.section}>
          <Title level={3}>社交链接</Title>
          <div className={styles.socials}>
            <a href="https://github.com/yourgithub" target="_blank" rel="noopener noreferrer">
              <GithubOutlined className={styles.icon} />
            </a>
            <a href="https://linkedin.com/in/yourlinkedin" target="_blank" rel="noopener noreferrer">
              <LinkedinOutlined className={styles.icon} />
            </a>
            <a href="mailto:yourmail@example.com">
              <MailOutlined className={styles.icon} />
            </a>
          </div>
        </div>
      </Content>
      <Footer className={styles.footer}>
        © 2025 张三 | 个人主页
      </Footer>
    </Layout>
  );
};

export default Profile;