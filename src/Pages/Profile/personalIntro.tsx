import React from "react";
import { Link } from "react-router-dom";
import { Avatar, Typography, Tag, Card } from "antd";
import {
  ArrowLeftOutlined,
  CompassOutlined,
  GithubOutlined,
  MailOutlined,
  LinkedinOutlined,
} from "@ant-design/icons";
import styles from "./personalIntro.module.css";
import avatar from "../../assets/avatar.png";
import cvPdf from "../../../asset/Huang_cv.pdf";

const { Title, Paragraph, Text } = Typography;

type BulletBlock = {
  key: string;
  title: string;
  meta?: string;
  description: string[];
  link?: string;
};

const Profile: React.FC = () => {
  const skills = [
    "Python",
    "C/C++",
    "SQL",
    "Java",
    "JavaScript/TypeScript",
    "PyTorch",
    "TensorFlow Lite",
    "Embedded C",
    "ReactJS",
    "Node.js/Express",
    "Flutter/Dart",
    "Docker",
    "Deep Learning",
  ];

  const careers: BulletBlock[] = [
    {
      key: "universe-action",
      title: "Universe Action Limited",
      meta: "AI Engineer · Apr 2024 – Present",
      description: [
        "Generative Modeling: Led R&D for large-scale TTS systems built on GPT-style Transformer architectures; implemented DeepSpeed, DDP, and AMP to improve training efficiency and stability on 4× H200 GPU clusters.",
        "Model Adaptation & Expansion: Drove LoRA-based fine-tuning to strengthen style control; expanded vocabulary/embedding layers for new language support and performed head re-alignment to maintain cross-lingual synthesis quality.",
        "Vocoder Optimization: Fine-tuned GAN / Flow Matching vocoders to reconstruct high-fidelity audio from GPT hidden latents, improving phase consistency and acoustic naturalness in target domains.",
        "Deployment & Orchestration: Migrated inference from Triton to Ray Serve; leveraged dynamic batching and engineered streaming audio output to reduce time-to-first-token (TTFT).",
        "Agentic Ecosystem: Built MCP toolsets bridging generative audio models with LLM agents for low-latency, end-to-end voice interaction.",
      ],
    },
    {
      key: "pivot-biomedical",
      title: "Pivot Biomedical Engineering",
      meta: "AI Engineer · Jun 2023 – Apr 2024",
      description: [
        "Medical AI Research: Developed AI-driven blood pressure measurement systems based on the Korotkoff sound method; engineered neural models to simulate clinical auscultation for more accurate blood pressure estimation.",
        "Spatiotemporal Modeling: Designed and optimized lightweight temporal architectures (LSTM, GRU, 1D-CNN) to capture dynamic arterial pulse-sound features during cuff deflation.",
        "Edge Optimization & Deployment: Focused on efficient, lightweight models for resource-constrained environments; applied post-training quantization (PTQ) and converted models to TensorFlow Lite for real-time mobile/embedded inference.",
        "Full-stack Integration: Built cross-platform mobile apps with Flutter/Dart and robust backends with Node.js/Express + SQL, delivering an end-to-end prototype from signal acquisition to digital health visualization.",
      ],
    },
  ];

  const researchItems: BulletBlock[] = [
    {
      key: "safe-d",
      title: "SAFE-D: Spatiotemporal Detection for Abnormal PD-like Driving",
      meta: "CityU · Intern · arXiv:2510.17517",
      description: [
        "Multimodal System Development: Built a high-fidelity data acquisition platform integrating CARLA Simulator with hardware controllers (Logitech G29) to synchronize and capture driving signals (steering, braking, acceleration).",
        "Cross-Modal Feature Fusion: Designed a Cross-Attention-based fusion architecture to align and integrate heterogeneous spatiotemporal features across modalities.",
        "Efficiency-Oriented Architecture: Selected and optimized a CNN backbone for spatiotemporal feature extraction, achieving 96.8% accuracy while meeting low-latency constraints for edge deployment.",
        "Clinical Pattern Recognition: Engineered the pipeline to identify subtle Parkinson’s Disease (PD)-related motor symptoms through time-series analysis of driving behavior data.",
      ],
      link: "https://arxiv.org/abs/2510.17517",
    },
    {
      key: "leveling3d",
      title:
        "Leveling3D: Leveling Up 3D Reconstruction with Feed-Forward 3D Gaussian Splatting and Geometry-Aware Generation",
      meta: "CUHK · Intern · arXiv:2603.16211",
      description: [
        "High-Fidelity 3D Reconstruction: Developed a hybrid pipeline integrating 2D view-refinement diffusion with 3D Gaussian Splatting (3DGS) to address geometric inconsistency under sparse-view scenarios.",
        "Systematic Optimization: Conducted comparative experiments on Stable Diffusion with multiple fine-tuning regimes (LoRA, full-parameter tuning, Adapters/ControlNet) to identify the most effective guidance mechanism for structural consistency.",
        "Ablation & Loss Engineering: Iteratively refined a multi-objective loss by balancing MSE, LPIPS (perceptual loss), and Gram-matrix loss through rigorous ablations, harmonizing pixel-level accuracy with high-level texture synthesis.",
        "Data Curation & Pipeline Integration: Built an automated curation pipeline with heuristic filtering and image restoration to remove noisy samples; integrated optimized 2D priors with feed-forward 3DGS to improve novel-view fidelity and geometric coherence.",
      ],
      link: "https://arxiv.org/abs/2603.16211",
    },
  ];

  const projects: BulletBlock[] = [
    {
      key: "cloud-vps",
      title: "Cloud VPS Development: Personal Websites & Services",
      description: [
        "Implementation: Implemented cloud-based VPS development to host personal websites and services.",
        "Deployment: Deployed services with Docker; built full-stack applications with Node.js and Python Flask.",
        "Keywords: VPS, Cloud Dev, Docker, Node.js, Python Flask.",
      ],
    },
    {
      key: "vtorch",
      title: "Vtorch: Graph-based Visual Interface for PyTorch",
      meta: "Supervisors: Xu Dan, Lionel Parreaux",
      description: [
        "Visualization: Built an interactive flow-chart visualization for ML pipelines using ReactFlow.",
        "Full-stack: Designed the frontend UI with ReactJS; implemented backend/data layer with NodeJS.",
        "Keywords: Frontend, Explainable ML, Visualization, TypeScript, ReactJS, NodeJS.",
      ],
      link: "https://github.com/xiaoyuanzi22333/VTorch-Frontend",
    },
    {
      key: "embeddedgan",
      title: "Edge-to-Photo Generation with EmbeddedGAN",
      meta: "Supervisor: Chen Qifeng",
      description: [
        "Architecture: Implemented a dual-branch EmbeddedGAN architecture for image-to-image generation.",
        "Innovation: Proposed and implemented a new noise generation method to improve generation quality and stability.",
        "Keywords: Image-to-Image Generation, GAN, PyTorch.",
      ],
      link: "https://github.com/xiaoyuanzi22333/EmbeddedGAN",
    },
  ];

  const year = new Date().getFullYear();

  const renderEmphasizedLine = (line: string) => {
    const idx = line.indexOf(":");
    if (idx <= 0) return <>{line}</>;
    const label = line.slice(0, idx + 1);
    const rest = line.slice(idx + 1);
    return (
      <>
        <span className={styles.emphasisLead}>{label}</span>
        {rest}
      </>
    );
  };

  const renderBulletCards = (items: BulletBlock[]) =>
    items.map((item) => (
      <Card key={item.key} title={item.title} className={styles.projectCard} hoverable>
        {item.meta ? (
          <Paragraph className={styles.projectMeta}>
            <Text type="secondary">{item.meta}</Text>
          </Paragraph>
        ) : null}
        {item.description.map((desc, index) => (
          <Paragraph key={index} className={styles.projectDesc}>
            {renderEmphasizedLine(desc)}
          </Paragraph>
        ))}
        {item.link ? (
          <a href={item.link} target="_blank" rel="noopener noreferrer" className={styles.projectLink}>
            {item.link.includes("arxiv.org") ? "Paper (arXiv)" : "View on GitHub"}
          </a>
        ) : null}
      </Card>
    ));

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <Link to="/" className={styles.backLink}>
          <ArrowLeftOutlined aria-hidden />
          Home
        </Link>
        <Link to="/chat" className={styles.backLink}>
          Chat
        </Link>
      </div>

      <header className={styles.header}>
        <h1 className={styles.headerTitle}>Profile</h1>
      </header>

      <main className={styles.main}>
        <section className={styles.bioSection}>
          <Avatar size={120} src={avatar} alt="Huang Baixiang" className={styles.avatar} />
          <Title level={2} className={styles.name}>
            Huang Baixiang
          </Title>
          <Paragraph className={styles.education}>
            <a href="mailto:xiaoyuanzi22333@gmail.com">xiaoyuanzi22333@gmail.com</a>
            {" · "}
            <a href="tel:+85265353524">+852 6535 3524</a>
          </Paragraph>
          <Paragraph className={styles.education}>
            <Text type="secondary">
              <span className={styles.emphasisLead}>Career Objective:</span> ML Algorithm Engineer (Computer Vision / Audio) ·
              AI-Agent System Engineer
            </Text>
          </Paragraph>
          <Paragraph className={styles.education}>
            <strong>Hong Kong University of Science and Technology</strong>
            <br />
            BEng in Computer Engineering · Sept 2020 – June 2024
          </Paragraph>
          <Paragraph className={styles.education}>
            <Text type="secondary">
              <span className={styles.emphasisLead}>Areas of Expertise:</span> Software Engineering, Machine Learning, Computer
              Vision, Neural Audio Modeling
            </Text>
          </Paragraph>
        </section>

        <section className={`${styles.section} ${styles.sectionLinks}`}>
          <Title level={3} className={styles.sectionTitle}>
            Links
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
              </a>
              <p>GitHub</p>
            </Card>

            <Card hoverable className={styles.socialCard}>
              <a
                href="https://www.linkedin.com/in/huang-baixiang-75773824a"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
              >
                <LinkedinOutlined className={styles.socialIcon} />
              </a>
              <p>LinkedIn</p>
            </Card>

            <Card hoverable className={styles.socialCard}>
              <a
                href={cvPdf}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
              >
                <CompassOutlined className={styles.socialIcon} />
              </a>
              <p>CV (PDF)</p>
            </Card>

            <Card hoverable className={styles.socialCard}>
              <a href="mailto:xiaoyuanzi22333@gmail.com" className={styles.socialLink}>
                <MailOutlined className={styles.socialIcon} />
              </a>
              <p>Email</p>
            </Card>
          </div>
        </section>

        <section className={`${styles.section} ${styles.sectionSkills}`}>
          <Title level={3} className={styles.sectionTitle}>
            Skills &amp; technologies
          </Title>
          <div className={styles.skills}>
            {skills.map((skill) => (
              <Tag key={skill} className={styles.skillTag}>
                {skill}
              </Tag>
            ))}
          </div>
        </section>

        <section className={`${styles.section} ${styles.sectionCareer}`}>
          <Title level={3} className={styles.sectionTitle}>
            Career
          </Title>
          <div className={styles.projects}>{renderBulletCards(careers)}</div>
        </section>

        <section className={`${styles.section} ${styles.sectionResearch}`}>
          <Title level={3} className={styles.sectionTitle}>
            Research
          </Title>
          <div className={styles.projects}>{renderBulletCards(researchItems)}</div>
        </section>

        <section className={`${styles.section} ${styles.sectionProjects}`}>
          <Title level={3} className={styles.sectionTitle}>
            Projects
          </Title>
          <div className={styles.projects}>{renderBulletCards(projects)}</div>
        </section>

        <section className={`${styles.section} ${styles.sectionHonors}`}>
          <Title level={3} className={styles.sectionTitle}>
            Honors
          </Title>
          <Card className={styles.projectCard} bordered>
            <Paragraph className={styles.projectDesc} style={{ marginBottom: 0 }}>
              Gold Medal at the 2024 HK-Techaton Exhibition
            </Paragraph>
          </Card>
        </section>
      </main>

      <footer className={styles.footer}>
        © {year} Huang Baixiang · Profile
      </footer>
    </div>
  );
};

export default Profile;
