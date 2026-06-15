
export interface ComingSoonProps {
    message?: string;
}

function ComingSoon({ message }: ComingSoonProps) {
    return (
        <div className="not-yet-implemented backdrop-blur-2xl">
            <p>Coming Soon</p>
            <span className="not-yet-implemented-subtext">
                {message ?? "We're currently building this feature. Check back soon for updates!"}
            </span>
        </div>
    );
}

export default ComingSoon;