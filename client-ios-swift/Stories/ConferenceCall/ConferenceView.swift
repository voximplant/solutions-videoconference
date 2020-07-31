/*
 *  Copyright (c) 2011-2020, Zingaya, Inc. All rights reserved.
 */

import UIKit
import VoxImplant

final class ConferenceView: UIView, VideoStreamObserver {
    private var enlargedParticipant: ParticipantID?
    private var participantViews: [ParticipantView] = [] {
        didSet {
            if let myIndex = participantViews.firstIndex(where: { $0.id == myID}) { // because local video view always placed first
                if myIndex != 0 {
                    participantViews.rearrange(from: myIndex, to: 0)
                }
            }
        }
    }
    private var defaultParticipantView: ConferenceParticipantView {
        let view = ConferenceParticipantView()

        let tapGesture = UITapGestureRecognizer(target: self, action: #selector(toggleParticipant))
        view.addGestureRecognizer(tapGesture)
        view.frame = CGRect(x: self.bounds.width / 2, y: self.bounds.height / 2, width: 0, height: 0)
        
        addSubview(view)
        
        return view
    }
    
    private var didDraw: Bool = false
    
    func addParticipant(_ participant: ConferenceParticipant) {
        guard participantViews.count <= 25 else {
            print("Limit!")
            return
        }
        updateView(getView(for: participant.id), with: participant)
        rearrange()
    }
    
    func updateParticipant(_ participant: ConferenceParticipant) {
        updateView(getView(for: participant.id), with: participant)
        rearrange()
    }
    
    func removeParticipant(withID id: ParticipantID) {
        removeView(for: id)
        rearrange()
    }
    
    // MARK: - VideoStreamObserver -
    func didAddVideoStream(
        for participant: ParticipantID,
        renderOn: (VIVideoRendererView?) -> Void
    ) {
        guard participantViews.count <= 25 else {
            print("Limit!")
            renderOn(nil)
            return
        }
        
        let participant = getView(for: participant)
        participant.videoEnabled = true
        
        let renderer = VIVideoRendererView(containerView: participant.streamView)
        renderer.resizeMode = Device.type == .iPad ? .fit : .fill
        renderOn(renderer)
    }
    
    func didRemoveVideoStream(for participant: ParticipantID) {
        getView(for: participant).videoEnabled = false
    }
    
    // MARK: - Private -
    private func getView(for id: ParticipantID) -> ConferenceParticipantView {
        if participantViews[id] == nil {
            participantViews.append(ParticipantView(id: id, view: defaultParticipantView))
        }

        return participantViews[id]!;
    }
    
    private func updateView(
        _ view: ConferenceParticipantView,
        with participant: ConferenceParticipant
    ) {
        view.name = participant.name
        view.audioEnabled = !participant.isMuted
        view.videoEnabled = participant.isSendingVideo || participant.isSharingScreen
    }
    
    private func removeView(for id: ParticipantID) {
        if let view = participantViews[id] {
            view.removeFromSuperview()
            participantViews.remove(for: id)
            
            if (id == enlargedParticipant) {
                enlargedParticipant = nil
            }
        }
    }
    
    override func layoutSubviews() {
        rearrange()
        super.layoutSubviews()
    }

    private func rearrange() {
        DispatchQueue.main.async { () -> Void in
            let surface = self.bounds.size
            
            if let rootParticipant = self.enlargedParticipant {
                guard let rootParticipantView = self.participantViews[rootParticipant]
                    else { return }
                self.participantViews.forEach { $0.view.alpha = 0 }
                rootParticipantView.frame = CGRect(x: 0, y: 0, width: surface.width, height: surface.height)
                rootParticipantView.alpha = 1
                
            } else {
                var w, h: CGFloat

                switch self.participantViews.count {
                case 0..<2:
                    w = 1; h = 1
                case 2:
                    w = 1; h = 2
                case 3..<5:
                    w = 2; h = 2
                case 5..<7:
                    w = 3; h = 2
                case 7..<10:
                    w = 3; h = 3
                case 10..<13:
                    w = 4; h = 3
                case 13..<17:
                    w = 4; h = 4
                case 17..<21:
                    w = 5; h = 4
                case 21..<26:
                    w = 5; h = 5
                default:
                    return
                }

                let size = CGSize(width: surface.width / w, height: surface.height / h)
                for (index, participantView) in self.participantViews.enumerated() {
                    participantView.view.alpha = 1
                    let x = index % Int(w)
                    let y = index / Int(w)
                    
                    participantView.view.frame = CGRect(origin: CGPoint(x: CGFloat(x) * size.width, y: CGFloat(y) * size.height), size: size)
                    participantView.view.layoutSubviews()
                }
            }
        }
    }
    
    override func draw(_ rect: CGRect) {
        super.draw(rect)
        
        if !didDraw {
            rearrange()
            didDraw = true
        }
    }

    @objc private func toggleParticipant(_ sender: UIGestureRecognizer!) {
        if let participantView = sender.view as? ConferenceParticipantView,
            let id = participantViews[participantView] {
            enlargedParticipant = id == enlargedParticipant ? nil : id
        }
        rearrange()
    }
}

fileprivate struct ParticipantView {
    let id: String
    var view: ConferenceParticipantView
}

fileprivate extension Array where Element == ParticipantView {
    subscript(id: String) -> ConferenceParticipantView? {
        self.first{ $0.id == id }?.view
    }
    
    subscript(view: ConferenceParticipantView) -> String? {
        self.first{ $0.view == view }?.id
    }
    
    mutating func remove(for id: String) {
        if let index = self.firstIndex(where: { $0.id == id }) {
            self.remove(at: index)
        }
    }
}

fileprivate extension RangeReplaceableCollection where Indices: Equatable {
    mutating func rearrange(from: Index, to: Index) {
        precondition(from != to && indices.contains(from) && indices.contains(to), "invalid indices")
        insert(remove(at: from), at: to)
    }
}
