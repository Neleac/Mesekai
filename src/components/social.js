import { FloatButton } from 'antd';
import { GithubOutlined, DiscordOutlined, LinkedinOutlined } from '@ant-design/icons';

export default function Social() {
    return (
        <>
            <a href='https://github.com/Neleac/Mesekai' target='_blank' rel='noopener noreferrer'>
                <FloatButton 
                    icon={<GithubOutlined />}
                    style={{position: 'absolute', bottom: '1%', right: '11%'}}
                />
            </a>
            <a href='https://discordapp.com/users/297770280863137802' target='_blank' rel='noopener noreferrer'>
                <FloatButton 
                    icon={<DiscordOutlined />}
                    style={{position: 'absolute', bottom: '1%', right: '6%'}}
                />
            </a>
            <a href='https://www.linkedin.com/in/caelenw/' target='_blank' rel='noopener noreferrer'>
                <FloatButton 
                    icon={<LinkedinOutlined />}
                    style={{position: 'absolute', bottom: '1%', right: '1%'}}
                />
            </a>
        </>
    );
}
